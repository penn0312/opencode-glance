import { createEffect, createMemo, createSignal, onCleanup } from "solid-js"
import type { ModelInfo, SessionInfo, SessionMessageInfo, TokenUsageInfo } from "@opencode/client"
import type { MessageKey, Params } from "../i18n"
import {
  activeStep,
  addTokens,
  cacheHit,
  compactNumber,
  contextUsage,
  countSteps,
  countTurns,
  EMPTY_TOKENS,
  estimateStepTokens,
  formatDuration,
  lastThroughput,
  stepActivity,
  throughput,
  totalTokens,
} from "./metrics"

export type StepsMode = "assistant" | "tool"
export type RateMode = "auto" | "average" | "last"

export type Translator = (key: MessageKey, params?: Params) => string
export type Pluralizer = (base: "glance.turn" | "glance.step", count: number) => string

/**
 * The session data a front end can read, as reactive getters. The TUI reads the plugin context's data
 * layer and the GUI reads the mounted session's, so the shapes differ; both adapt into this interface.
 * Every getter is called inside a memo, so it must read the front end's reactive store.
 */
export type GlanceSource = {
  messages(): ReadonlyArray<SessionMessageInfo>
  session(): SessionInfo | undefined
  /** Session ids whose tokens belong to this session, including subagent families. */
  family(): ReadonlyArray<string>
  sessionTokens(id: string): TokenUsageInfo | undefined
  models(): ReadonlyArray<ModelInfo> | undefined
  running(): boolean
}

export type GlanceOptions = {
  steps: StepsMode
  rate: RateMode
  t: Translator
  plural: Pluralizer
}

export function resolveRate(value: unknown): RateMode {
  if (value === "average" || value === "last" || value === "auto") return value
  return "auto"
}

export function resolveSteps(value: unknown): StepsMode {
  return value === "tool" ? "tool" : "assistant"
}

/** Truncates a tool name so a long MCP tool does not push the bar past its slot. */
export function shortName(name: string, length = 18): string {
  return name.length > length ? `${name.slice(0, length - 1)}…` : name
}

/**
 * A cheap identity for everything the history scans depend on. Message history is append-only and only the
 * tail message mutates while it streams: it gains tokens and a completion time when its step ends. Earlier
 * messages are settled, so the tail plus the length is enough to know when the scans must run again. This
 * keeps a streaming delta from re-scanning thousands of settled messages on every token.
 */
export function historyKey(messages: ReadonlyArray<SessionMessageInfo>): string {
  const last = messages[messages.length - 1]
  if (!last) return "0"
  if (last.type === "assistant") {
    return [
      messages.length,
      last.id,
      "a",
      last.time.completed ?? 0,
      last.time.streamed ?? 0,
      last.tokens?.input ?? 0,
      last.tokens?.output ?? 0,
      last.tokens?.cache.read ?? 0,
      last.tokens?.cache.write ?? 0,
    ].join("|")
  }
  if (last.type === "compaction") return `${messages.length}|${last.id}|c|${last.status}`
  return `${messages.length}|${last.id}|${last.type}`
}

const present = (value: string | undefined): value is string => value !== undefined

export type SettledHistory = {
  /** Identity of the message shape this snapshot was taken from. */
  key: string
  messages: ReadonlyArray<SessionMessageInfo>
}

/**
 * Reuses the previous snapshot when the history key still holds, so a memo over it keeps its identity and the
 * scans that depend on it stay inert while the active step streams.
 */
export function settleHistory(
  previous: SettledHistory | undefined,
  messages: ReadonlyArray<SessionMessageInfo>,
): SettledHistory {
  const key = historyKey(messages)
  return previous && previous.key === key ? previous : { key, messages }
}

/**
 * Everything the TUI and the GUI render, from one shared source. Both front ends had their own copy of this
 * layer; keeping it here means a new metric or a changed wording only has to be written once.
 */
export function createGlance(source: GlanceSource, options: GlanceOptions) {
  const [now, setNow] = createSignal(Date.now())
  const [live, setLive] = createSignal<number>()

  // Only tick while the session runs; this drives the live tool/step elapsed label.
  createEffect(() => {
    if (!source.running()) return
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 1_000)
    onCleanup(() => clearInterval(timer))
  })

  // Settled history: re-read only when the message shape or the tail changes, not on every streamed delta.
  // The snapshot object keeps its identity while the key holds, so the scans below do not rerun either.
  const history = createMemo<SettledHistory>((previous) => settleHistory(previous, source.messages()))

  const family = createMemo(() => source.family())
  const totals = createMemo(() =>
    family().reduce((total, id) => addTokens(total, source.sessionTokens(id)), EMPTY_TOKENS),
  )

  const usage = createMemo(() =>
    contextUsage(history().messages, source.models(), source.session()?.revert?.messageID),
  )
  const turns = createMemo(() => countTurns(history().messages))
  const steps = createMemo(() => countSteps(history().messages, options.steps))
  const averageRate = createMemo(() => throughput(history().messages))
  const latestRate = createMemo(() => lastThroughput(history().messages))
  const hit = createMemo(() => cacheHit(totals()))
  const running = createMemo(() => source.running())

  // The active step must be read live: its content changes on every token.
  const active = createMemo(() => activeStep(source.messages()))
  const estimated = createMemo(() => {
    const step = active()
    return step ? estimateStepTokens(step) : 0
  })
  const activity = createMemo(() => stepActivity(active(), estimated(), now()))

  // Smooth the character-based estimate so the number does not jump on every delta.
  createEffect(() => {
    const current = activity()
    if (!running() || !current || current.kind !== "streaming" || current.rate === undefined) {
      setLive(undefined)
      return
    }
    const raw = current.rate
    setLive((previous) => (previous === undefined ? raw : Math.round(previous * 0.65 + raw * 0.35)))
  })

  const speed = createMemo(() => {
    if (options.rate === "average") return averageRate()
    return latestRate() ?? averageRate()
  })

  const turnText = createMemo(
    () => `${options.plural("glance.turn", turns())} ${options.plural("glance.step", steps())}`,
  )
  const tokensText = createMemo(() =>
    options.t("glance.tokens", { tokens: compactNumber(totalTokens(totals())) }),
  )
  const cacheText = createMemo(() => {
    const value = hit()
    return value === undefined ? undefined : options.t("glance.cache", { percent: value })
  })
  const contextText = createMemo(() => {
    const value = usage()?.percent
    return value === undefined ? "—" : options.t("glance.context", { percent: value })
  })

  const activityText = createMemo(() => {
    const current = activity()
    if (!running()) {
      const value = speed()
      return value === undefined ? undefined : options.t("glance.rate", { rate: value })
    }
    if (!current) return options.t("glance.preparing")
    if (current.kind === "tool")
      return options.t("glance.tool", { name: shortName(current.name), elapsed: formatDuration(current.elapsed) })
    if (current.kind === "waiting")
      return options.t("glance.waiting", { elapsed: formatDuration(current.elapsed) })
    const elapsed = formatDuration(current.elapsed)
    if (options.rate === "auto" && live() !== undefined)
      return options.t("glance.live", { rate: live()!, elapsed })
    const exact = options.rate === "average" ? averageRate() : latestRate() ?? averageRate()
    return exact === undefined
      ? options.t("glance.streaming", { elapsed })
      : options.t("glance.rateElapsed", { rate: exact, elapsed })
  })

  const progressText = createMemo(() =>
    activityText() ? `${turnText()} · ${activityText()}` : turnText(),
  )
  const usageText = createMemo(() =>
    cacheText() ? `${tokensText()} · ${cacheText()}` : tokensText(),
  )
  const compactText = createMemo(() => `${turns()}/${steps()} · ${contextText()}`)
  const mediumText = createMemo(() =>
    (running()
      ? [turnText(), activityText(), tokensText(), contextText()]
      : [turnText(), activityText(), tokensText(), cacheText(), contextText()]
    )
      .filter(present)
      .join(" · "),
  )

  return {
    totals,
    hit,
    usage,
    turns,
    steps,
    running,
    speed,
    activity,
    turnText,
    tokensText,
    cacheText,
    contextText,
    activityText,
    progressText,
    usageText,
    compactText,
    mediumText,
  }
}

export type Glance = ReturnType<typeof createGlance>
