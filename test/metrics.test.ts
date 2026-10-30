import { describe, expect, it } from "vitest"
import type { SessionMessageInfo } from "@opencode/client"
import {
  addTokens,
  cacheHit,
  compactNumber,
  contextUsage,
  countSteps,
  countTurns,
  EMPTY_TOKENS,
  estimateStepTokens,
  estimateTextTokens,
  formatDuration,
  lastAssistantWithUsage,
  lastThroughput,
  throughput,
  totalTokens,
} from "../src/shared/metrics"
import { historyKey, resolveRate, resolveSteps, settleHistory, shortName } from "../src/shared/glance"
import { assistant, compaction, model, usage, user, type Part } from "./fixtures"

describe("token totals", () => {
  it("counts every bucket the provider reports", () => {
    expect(totalTokens(usage({ input: 10, output: 20, reasoning: 5 }, { read: 100, write: 50 }))).toBe(185)
  })

  it("adds usage and ignores missing records", () => {
    expect(addTokens(EMPTY_TOKENS, undefined)).toBe(EMPTY_TOKENS)
    expect(addTokens(usage({ input: 1 }, { read: 2 }), usage({ output: 3 }, { read: 4 }))).toEqual({
      input: 1,
      output: 3,
      reasoning: 0,
      cache: { read: 6, write: 0 },
    })
  })

  it("never mutates the empty record", () => {
    addTokens(EMPTY_TOKENS, usage({ input: 5 }))
    expect(EMPTY_TOKENS).toEqual({ input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } })
  })
})

describe("turns and steps", () => {
  const messages = [
    user("u1"),
    assistant({ id: "a1" }),
    assistant({ id: "a2" }),
    user("u2"),
    compaction("c1", "completed"),
  ]

  it("counts user prompts as turns and skips other message types", () => {
    expect(countTurns(messages)).toBe(2)
  })

  it("counts assistant messages as steps by default", () => {
    expect(countSteps(messages)).toBe(2)
  })

  it("counts tool parts when asked", () => {
    const withTools = [
      user("u1"),
      assistant({ id: "a1", content: [{ type: "tool" }, { type: "tool" }, { type: "text", text: "hi" }] as Part[] }),
      assistant({ id: "a2", content: [{ type: "tool" }] as Part[] }),
    ]
    expect(countSteps(withTools, "tool")).toBe(3)
  })
})

describe("throughput", () => {
  it("weights finished steps by their streaming time", () => {
    const messages = [
      assistant({ id: "a1", created: 0, streamed: 2_000, tokens: usage({ output: 100 }) }),
      assistant({ id: "a2", created: 0, streamed: 1_000, tokens: usage({ output: 50, reasoning: 50 }) }),
    ]
    expect(throughput(messages)).toBe(67)
    expect(lastThroughput(messages)).toBe(100)
  })

  it("skips steps without usage, without a streamed time, and tool-only steps", () => {
    const messages = [
      assistant({ id: "a1", created: 0, streamed: 1_000, tokens: usage({ output: 60 }) }),
      assistant({ id: "a2", created: 0, tokens: usage({ output: 999 }) }),
      assistant({ id: "a3", created: 0, streamed: 1_000, tokens: usage() }),
      assistant({ id: "a4", created: 5_000, streamed: 4_000, tokens: usage({ output: 10 }) }),
    ]
    expect(throughput(messages)).toBe(60)
    expect(lastThroughput(messages)).toBe(60)
  })

  it("returns undefined when no step qualifies", () => {
    expect(throughput([user("u1")])).toBeUndefined()
    expect(lastThroughput([])).toBeUndefined()
  })
})

describe("live estimate", () => {
  it("counts CJK as one token and other characters as a quarter, ignoring whitespace", () => {
    expect(estimateTextTokens("abcd")).toBe(1)
    expect(estimateTextTokens("abcde")).toBe(2)
    expect(estimateTextTokens("你好世界")).toBe(4)
    expect(estimateTextTokens("你好 abcd")).toBe(3)
  })

  it("estimates text, reasoning, streaming tool input, and settled tool input", () => {
    const message = assistant({
      content: [
        { type: "text", text: "abcd" },
        { type: "reasoning", text: "abcd" },
        { type: "tool", name: "bash", state: { status: "streaming", input: "abcdefgh" }, time: { created: 0 } },
        {
          type: "tool",
          name: "read",
          state: { status: "completed", input: { path: "abcd" } },
          time: { created: 0 },
        },
      ] as Part[],
    })
    const step = message as Extract<SessionMessageInfo, { type: "assistant" }>
    // 1 + 1 + 2 + ceil(JSON.stringify({path:"abcd"}).length / 4)
    expect(estimateStepTokens(step)).toBe(1 + 1 + 2 + Math.ceil(JSON.stringify({ path: "abcd" }).length / 4))
  })
})

describe("formatDuration", () => {
  it("uses the shortest readable unit", () => {
    expect(formatDuration(0)).toBe("0s")
    expect(formatDuration(59.9)).toBe("59s")
    expect(formatDuration(60)).toBe("1m")
    expect(formatDuration(125)).toBe("2m 5s")
    expect(formatDuration(3_600)).toBe("1h")
    expect(formatDuration(3_900)).toBe("1h 5m")
    expect(formatDuration(-4)).toBe("0s")
  })
})

describe("cacheHit", () => {
  it("is the cached share of all input", () => {
    expect(cacheHit(usage({ input: 10 }, { read: 90 }))).toBe(90)
    expect(cacheHit(usage({ input: 50 }, { read: 50, write: 0 }))).toBe(50)
  })

  it("counts cache writes as misses and clamps", () => {
    expect(cacheHit(usage({ input: 0 }, { read: 100, write: 100 }))).toBe(50)
    expect(cacheHit(usage())).toBeUndefined()
  })
})

describe("context selection", () => {
  const messages = [
    user("u1"),
    assistant({ id: "a1", tokens: usage({ input: 1_000 }) }),
    compaction("c1", "completed"),
    user("u2"),
    assistant({ id: "a2", tokens: usage({ input: 2_000 }) }),
    assistant({ id: "a3" }),
    user("u3"),
    assistant({ id: "a4", tokens: usage({ input: 3_000 }) }),
  ]

  it("takes the latest assistant step after the last completed compaction", () => {
    expect(lastAssistantWithUsage(messages)?.id).toBe("a4")
  })

  it("stops before the revert boundary", () => {
    expect(lastAssistantWithUsage(messages, "a3")?.id).toBe("a2")
    expect(lastAssistantWithUsage(messages, "missing")).toBeUndefined()
  })

  it("reports tokens and a clamped share of the model limit", () => {
    const models = [model(10_000)]
    expect(contextUsage(messages, models)).toEqual({ tokens: 3_000, percent: 30 })
    expect(contextUsage(messages, [model(1_000)])?.percent).toBe(100)
    expect(contextUsage(messages, undefined)?.percent).toBeUndefined()
    expect(contextUsage([user("u1")], models)).toBeUndefined()
  })
})

describe("compactNumber", () => {
  it("keeps small values as-is", () => {
    expect(compactNumber(0)).toBe("0")
    expect(compactNumber(999)).toBe("999")
  })

  it("uses compact units", () => {
    expect(compactNumber(1_000)).toBe("1K")
    expect(compactNumber(1_500)).toBe("1.5K")
    expect(compactNumber(16_200_000)).toBe("16.2M")
    expect(compactNumber(1_000_000_000)).toBe("1B")
  })

  it("moves to the next unit instead of printing 1000 of the smaller one", () => {
    expect(compactNumber(999_949)).toBe("999.9K")
    expect(compactNumber(999_999)).toBe("1M")
    expect(compactNumber(999_999_999)).toBe("1B")
  })
})

describe("historyKey", () => {
  it("is stable while only the tail content streams", () => {
    const active = assistant({ id: "a1", created: 0, content: [{ type: "text", text: "a" }] as Part[] })
    const streamedMore = assistant({ id: "a1", created: 0, content: [{ type: "text", text: "ab" }] as Part[] })
    expect(historyKey([user("u1"), active])).toBe(historyKey([user("u1"), streamedMore]))
  })

  it("changes when the step ends, tokens arrive, or a message is appended", () => {
    const base = [user("u1"), assistant({ id: "a1", created: 0 })]
    const completed = [user("u1"), assistant({ id: "a1", created: 0, completed: 5 })]
    const withTokens = [user("u1"), assistant({ id: "a1", created: 0, completed: 5, tokens: usage({ output: 1 }) })]
    const appended = [...withTokens, user("u2")]

    expect(historyKey(base)).not.toBe(historyKey(completed))
    expect(historyKey(completed)).not.toBe(historyKey(withTokens))
    expect(historyKey(withTokens)).not.toBe(historyKey(appended))
  })

  it("tracks a compaction status change", () => {
    expect(historyKey([compaction("c1", "running")])).not.toBe(historyKey([compaction("c1", "completed")]))
    expect(historyKey([])).toBe("0")
  })
})

describe("settleHistory", () => {
  const list = [user("u1"), assistant({ id: "a1", created: 0 })]

  it("reuses the snapshot while only the tail content streams", () => {
    const first = settleHistory(undefined, list)
    const streamed = settleHistory(first, [
      user("u1"),
      assistant({ id: "a1", created: 0, content: [{ type: "text", text: "more" }] as Part[] }),
    ])
    expect(streamed).toBe(first)
  })

  it("takes a new snapshot when the step settles or a message is appended", () => {
    const first = settleHistory(undefined, list)
    const settled = settleHistory(first, [user("u1"), assistant({ id: "a1", created: 0, completed: 1 })])
    const appended = settleHistory(settled, [...list, user("u2")])

    expect(settled).not.toBe(first)
    expect(appended).not.toBe(settled)
    expect(appended.messages).toHaveLength(3)
  })
})

describe("option resolution", () => {
  it("falls back to the documented defaults", () => {
    expect(resolveRate(undefined)).toBe("auto")
    expect(resolveRate("last")).toBe("last")
    expect(resolveRate("nonsense")).toBe("auto")
    expect(resolveSteps(undefined)).toBe("assistant")
    expect(resolveSteps("tool")).toBe("tool")
    expect(resolveSteps(42)).toBe("assistant")
  })

  it("truncates long tool names", () => {
    expect(shortName("bash")).toBe("bash")
    expect(shortName("x".repeat(30))).toHaveLength(18)
    expect(shortName("x".repeat(30)).endsWith("…")).toBe(true)
  })
})
