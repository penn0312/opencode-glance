import { createRoot, createSignal } from "solid-js"
import { describe, expect, it } from "vitest"
import type { SessionInfo } from "@opencode/client"
import type { Params } from "../src/i18n"
import { createGlance } from "../src/shared/glance"
import { assistant, model, usage, user } from "./fixtures"

// A translator that keeps the key and the params visible, so assertions read like the real copy.
const t = (key: string, params?: Params) => (params ? `${key}:${Object.values(params).join(",")}` : key)
const plural = (base: string, count: number) => `${count} ${base}`

const session = { tokens: usage({ input: 500 }) } as unknown as SessionInfo

describe("createGlance", () => {
  it("derives every label from one source and follows new messages", () => {
    const [messages, setMessages] = createSignal([
      user("u1"),
      assistant({
        id: "a1",
        created: 0,
        streamed: 1_000,
        completed: 1_000,
        tokens: usage({ output: 1_000 }),
      }),
    ])

    let dispose!: () => void
    const glance = createRoot((d) => {
      dispose = d
      return createGlance(
        {
          messages,
          session: () => session,
          family: () => ["s1"],
          sessionTokens: () => usage({ input: 500 }, { read: 4_500 }),
          models: () => [model(10_000)],
          running: () => false,
        },
        { steps: "assistant", rate: "auto", t, plural },
      )
    })

    expect(glance.turns()).toBe(1)
    expect(glance.steps()).toBe(1)
    expect(glance.turnText()).toBe("1 glance.turn 1 glance.step")
    expect(glance.tokensText()).toBe("glance.tokens:5K")
    expect(glance.cacheText()).toBe("glance.cache:90")
    expect(glance.contextText()).toBe("glance.context:10")
    expect(glance.activityText()).toBe("glance.rate:1000")
    expect(glance.progressText()).toBe("1 glance.turn 1 glance.step · glance.rate:1000")
    expect(glance.usageText()).toBe("glance.tokens:5K · glance.cache:90")
    expect(glance.compactText()).toBe("1/1 · glance.context:10")

    setMessages((list) => [...list, user("u2")])
    expect(glance.turns()).toBe(2)
    expect(glance.steps()).toBe(1)

    dispose()
  })

  it("shows the waiting label while a running step has produced nothing yet", () => {
    const [running, setRunning] = createSignal(true)
    const messages = [user("u1"), assistant({ id: "a1", created: Date.now() })]

    let dispose!: () => void
    const glance = createRoot((d) => {
      dispose = d
      return createGlance(
        {
          messages: () => messages,
          session: () => session,
          family: () => [],
          sessionTokens: () => undefined,
          models: () => undefined,
          running,
        },
        { steps: "tool", rate: "auto", t, plural },
      )
    })

    expect(glance.activityText()).toBe("glance.waiting:0s")
    expect(glance.contextText()).toBe("—")

    setRunning(false)
    expect(glance.activityText()).toBeUndefined()

    dispose()
  })
})
