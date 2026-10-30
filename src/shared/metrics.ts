import type { ModelInfo, SessionMessageInfo, TokenUsageInfo } from "@opencode/client"

export type { ModelInfo, SessionMessageInfo, TokenUsageInfo }

/** A zeroed usage record. Never mutated. */
export const EMPTY_TOKENS: TokenUsageInfo = {
  input: 0,
  output: 0,
  reasoning: 0,
  cache: { read: 0, write: 0 },
}

export function addTokens(a: TokenUsageInfo, b: TokenUsageInfo | undefined): TokenUsageInfo {
  if (!b) return a
  return {
    input: a.input + b.input,
    output: a.output + b.output,
    reasoning: a.reasoning + b.reasoning,
    cache: {
      read: a.cache.read + b.cache.read,
      write: a.cache.write + b.cache.write,
    },
  }
}

/** Every token the provider reported: fresh input, output, reasoning, cache reads and cache writes. */
export function totalTokens(tokens: TokenUsageInfo): number {
  return tokens.input + tokens.output + tokens.reasoning + tokens.cache.read + tokens.cache.write
}

/** User prompts in the session history. Synthetic guidance is a different message type. */
export function countTurns(messages: ReadonlyArray<SessionMessageInfo>): number {
  return messages.reduce((count, message) => count + (message.type === "user" ? 1 : 0), 0)
}

/**
 * Agent steps. OpenCode's own SessionStats counts assistant messages as steps, which is the default here.
 * `tool` counts tool calls instead, for people who think of a step as one tool invocation.
 */
export function countSteps(
  messages: ReadonlyArray<SessionMessageInfo>,
  mode: "assistant" | "tool" = "assistant",
): number {
  if (mode === "tool") {
    return messages.reduce((count, message) => {
      if (message.type !== "assistant") return count
      return count + message.content.reduce((sum, part) => sum + (part.type === "tool" ? 1 : 0), 0)
    }, 0)
  }
  return messages.reduce((count, message) => count + (message.type === "assistant" ? 1 : 0), 0)
}

/**
 * Weighted generation speed over completed steps: visible output plus reasoning tokens, divided by the time
 * between the step starting and the provider stream ending. `tokens` is only written when a step ends, so this
 * is an average over finished steps, not a live counter. Steps that only produced tool calls are skipped.
 */
export function throughput(messages: ReadonlyArray<SessionMessageInfo>): number | undefined {
  let output = 0
  let seconds = 0
  for (const message of messages) {
    if (message.type !== "assistant" || !message.tokens) continue
    if (typeof message.time.streamed !== "number") continue
    const generated = message.tokens.output + message.tokens.reasoning
    if (generated <= 0) continue
    const elapsed = (message.time.streamed - message.time.created) / 1_000
    if (elapsed <= 0) continue
    output += generated
    seconds += elapsed
  }
  return seconds > 0 ? Math.round(output / seconds) : undefined
}

/** Speed of the most recent completed step that generated output. More responsive than the session average. */
export function lastThroughput(messages: ReadonlyArray<SessionMessageInfo>): number | undefined {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index]
    if (!message || message.type !== "assistant" || !message.tokens) continue
    if (typeof message.time.streamed !== "number") continue
    const generated = message.tokens.output + message.tokens.reasoning
    if (generated <= 0) continue
    const elapsed = (message.time.streamed - message.time.created) / 1_000
    if (elapsed <= 0) continue
    return Math.round(generated / elapsed)
  }
  return undefined
}

type AssistantStep = Extract<SessionMessageInfo, { type: "assistant" }>
type AssistantTool = Extract<AssistantStep["content"][number], { type: "tool" }>

export type StepActivity =
  | { readonly kind: "waiting"; readonly elapsed: number }
  | {
      readonly kind: "streaming"
      readonly elapsed: number
      readonly estimatedTokens: number
      readonly rate?: number
    }
  | { readonly kind: "tool"; readonly name: string; readonly elapsed: number }

/** The assistant step still being produced, if the session is between steps it is undefined. */
export function activeStep(messages: ReadonlyArray<SessionMessageInfo>): AssistantStep | undefined {
  return messages.findLast(
    (message): message is AssistantStep => message.type === "assistant" && message.time.completed === undefined,
  )
}

const CJK =
  /[\u2e80-\u2eff\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/

/**
 * Rough token estimate for text that is still streaming. CJK characters count as one token each and other
 * characters as a quarter. It is only used for the live speed indicator, which is prefixed with "~".
 */
export function estimateTextTokens(text: string): number {
  let cjk = 0
  let other = 0
  for (const character of text) {
    if (/\s/.test(character)) continue
    if (CJK.test(character)) cjk++
    else other++
  }
  return Math.ceil(cjk + other / 4)
}

/** Estimated generated tokens in a partially streamed step: text, reasoning, and tool-call input. */
export function estimateStepTokens(message: AssistantStep): number {
  let total = 0
  for (const part of message.content) {
    if (part.type === "text" || part.type === "reasoning") {
      total += estimateTextTokens(part.text)
      continue
    }
    if (part.type !== "tool") continue
    const input = part.state.status === "streaming" ? part.state.input : JSON.stringify(part.state.input)
    total += Math.ceil((input?.length ?? 0) / 4)
  }
  return total
}

function runningTool(message: AssistantStep): AssistantTool | undefined {
  return message.content.findLast(
    (part): part is AssistantTool => part.type === "tool" && part.state.status === "running",
  )
}

/** What the active step is doing now: waiting for output, streaming, or running a tool. */
export function stepActivity(
  message: AssistantStep | undefined,
  estimatedTokens: number,
  now: number,
): StepActivity | undefined {
  if (!message) return
  const elapsed = Math.max(0, (now - message.time.created) / 1_000)
  const tool = runningTool(message)
  if (tool) {
    const started = tool.time.ran ?? tool.time.created
    return { kind: "tool", name: tool.name, elapsed: Math.max(0, (now - started) / 1_000) }
  }
  if (estimatedTokens > 0) {
    return {
      kind: "streaming",
      elapsed,
      estimatedTokens,
      rate: elapsed >= 2 ? Math.round(estimatedTokens / elapsed) : undefined,
    }
  }
  return { kind: "waiting", elapsed }
}

/** Short elapsed label for a live indicator: 12s, 2m 5s, 1h 3m. */
export function formatDuration(seconds: number): string {
  const value = Math.max(0, Math.floor(seconds))
  if (value < 60) return `${value}s`
  const minutes = Math.floor(value / 60)
  if (minutes < 60) {
    const rest = value % 60
    return rest ? `${minutes}m ${rest}s` : `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}


/** Cached input as a share of all input. Cache writes were misses, so they stay in the denominator. */
export function cacheHit(tokens: TokenUsageInfo): number | undefined {
  const input = tokens.input + tokens.cache.read + tokens.cache.write
  if (input <= 0) return undefined
  return Math.max(0, Math.min(100, Math.round((tokens.cache.read / input) * 100)))
}

type AssistantWithUsage = Extract<SessionMessageInfo, { type: "assistant" }> & {
  tokens: TokenUsageInfo
}

/**
 * The assistant step whose tokens currently fill the context window: the latest one after the last completed
 * compaction and before the undo boundary. This is the same selection the TUI and the desktop app use.
 */
export function lastAssistantWithUsage(
  messages: ReadonlyArray<SessionMessageInfo>,
  boundary?: string,
): AssistantWithUsage | undefined {
  const boundaryIndex = boundary ? messages.findIndex((message) => message.id === boundary) : -1
  if (boundary && boundaryIndex === -1) return undefined
  const end = boundaryIndex === -1 ? messages.length : boundaryIndex
  const compactionIndex = messages.findLastIndex(
    (message, index) => message.type === "compaction" && message.status === "completed" && index < end,
  )
  return messages.findLast(
    (message, index): message is AssistantWithUsage =>
      message.type === "assistant" && message.tokens !== undefined && index > compactionIndex && index < end,
  )
}

export function contextUsage(
  messages: ReadonlyArray<SessionMessageInfo>,
  models: ReadonlyArray<ModelInfo> | undefined,
  boundary?: string,
): { tokens: number; percent?: number } | undefined {
  const message = lastAssistantWithUsage(messages, boundary)
  if (!message) return
  const tokens = totalTokens(message.tokens)
  if (tokens <= 0) return
  const model = models?.find(
    (item) => item.providerID === message.model.providerID && item.id === message.model.id,
  )
  return {
    tokens,
    // Clamp like cacheHit: a model limit can be exceeded, but the bar should never read 103%.
    percent: model?.limit.context
      ? Math.max(0, Math.min(100, Math.round((tokens / model.limit.context) * 100)))
      : undefined,
  }
}

/**
 * 1_234 -> "1.2K", 16_200_000 -> "16.2M". Keeps the compact look of a glanceable status line.
 * A value that rounds up to 1000 in its unit moves to the next one (999_999 -> "1M", not "1000K").
 */
export function compactNumber(value: number): string {
  if (!Number.isFinite(value) || value < 0) return String(value)
  const units: ReadonlyArray<readonly [number, string]> = [
    [1_000, "K"],
    [1_000_000, "M"],
    [1_000_000_000, "B"],
    [1_000_000_000_000, "T"],
  ]
  let index = -1
  for (let candidate = 0; candidate < units.length; candidate++) {
    if (value >= units[candidate]![0]) index = candidate
  }
  if (index === -1) return String(value)
  let scaled = Number((value / units[index]![0]).toFixed(1))
  if (scaled >= 1_000 && index + 1 < units.length) {
    index++
    scaled = Number((value / units[index]![0]).toFixed(1))
  }
  return `${scaled}${units[index]![1]}`
}
