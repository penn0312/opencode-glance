import type { ModelInfo, SessionMessageInfo, TokenUsageInfo } from "@opencode/client"

export type Assistant = Extract<SessionMessageInfo, { type: "assistant" }>
export type Part = Assistant["content"][number]

export const usage = (
  input: Partial<Omit<TokenUsageInfo, "cache">> = {},
  cache: Partial<TokenUsageInfo["cache"]> = {},
): TokenUsageInfo => ({
  input: 0,
  output: 0,
  reasoning: 0,
  ...input,
  cache: { read: 0, write: 0, ...cache },
})

export const asMessage = (value: object) => value as unknown as SessionMessageInfo

export const user = (id: string): SessionMessageInfo =>
  asMessage({ id, type: "user", time: { created: 0 } })

export const compaction = (id: string, status: "running" | "completed" | "failed"): SessionMessageInfo =>
  asMessage({ id, type: "compaction", status })

export const assistant = (value: {
  id?: string
  created?: number
  streamed?: number
  completed?: number
  tokens?: TokenUsageInfo
  content?: Part[]
  providerID?: string
  modelID?: string
}): SessionMessageInfo =>
  asMessage({
    id: value.id ?? "a1",
    type: "assistant",
    agent: "build",
    model: { providerID: value.providerID ?? "provider", id: value.modelID ?? "model" },
    time: { created: value.created ?? 0, streamed: value.streamed, completed: value.completed },
    content: value.content ?? [],
    tokens: value.tokens,
  })

export const model = (contextLimit: number): ModelInfo =>
  ({ providerID: "provider", id: "model", limit: { context: contextLimit } }) as unknown as ModelInfo
