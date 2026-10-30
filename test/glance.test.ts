import { createRoot, createSignal } from "solid-js"
import { createStore } from "solid-js/store"
import { describe, expect, it } from "vitest"
import type { SessionInfo, SessionMessageInfo } from "@opencode/client"
import type { Params } from "../src/i18n"
import { createGlance } from "../src/shared/glance"
import { assistant, model, usage, user, type Assistant, type Part } from "./fixtures"

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

  it("follows one step from waiting to streaming to a finished rate", async () => {
    const [running, setRunning] = createSignal(true)
    const [messages, setMessages] = createSignal([user("u1")])
    const started = Date.now() - 5_000

    let dispose!: () => void
    const glance = createRoot((d) => {
      dispose = d
      return createGlance(
        {
          messages,
          session: () => session,
          family: () => ["s1"],
          sessionTokens: () => usage({ input: 500 }),
          models: () => [model(10_000)],
          running,
        },
        { steps: "assistant", rate: "auto", t, plural },
      )
    })

    // Running, but the step has not been created yet.
    expect(glance.activityText()).toBe("glance.preparing")

    // The step starts: nothing has streamed yet.
    setMessages([user("u1"), assistant({ id: "a1", created: started })])
    expect(glance.activityText()).toBe("glance.waiting:5s")

    // Text arrives: the live estimate produces a smoothed rate once effects flush.
    setMessages([user("u1"), assistant({ id: "a1", created: started, content: [{ type: "text", text: "abcd" }] as Part[] })])
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(glance.activityText()).toBe("glance.live:0,5s")
    expect(glance.turns()).toBe(1)
    expect(glance.steps()).toBe(1)

    // The step settles: the bar shows the exact rate and the context window moves.
    setRunning(false)
    setMessages([
      user("u1"),
      assistant({ id: "a1", created: started, streamed: started + 5_000, completed: started + 5_000, tokens: usage({ output: 100 }) }),
    ])
    expect(glance.activityText()).toBe("glance.rate:20")
    expect(glance.contextText()).toBe("glance.context:1")

    dispose()
  })

  it("keeps tracking a step whose content is updated in place", () => {
    const started = Date.now() - 5_000
    const [state, setState] = createStore({
      messages: [
        user("u1"),
        assistant({
          id: "a1",
          created: started,
          content: [
            { type: "text", text: "a" },
            {
              type: "tool",
              id: "tool1",
              name: "bash",
              state: { status: "streaming", input: "" },
              time: { created: started },
            },
          ] as Part[],
        }) as Assistant,
      ] as [SessionMessageInfo, Assistant],
    })

    let dispose!: () => void
    const glance = createRoot((d) => {
      dispose = d
      return createGlance(
        {
          messages: () => state.messages,
          session: () => session,
          family: () => ["s1"],
          sessionTokens: () => usage(),
          models: () => [model(10_000)],
          running: () => true,
        },
        { steps: "assistant", rate: "auto", t, plural },
      )
    })

    const first = glance.activity()
    expect(first?.kind).toBe("streaming")

    // The store keeps the message identity and replaces only the text node, which is how the client
    // data layer applies content deltas.
    const step = state.messages[1]
    setState("messages", 1, "content", 0, { type: "text", text: "abcdefghijklmnopqrst" } as Part)
    expect(state.messages[1]).toBe(step)
    const next = glance.activity()
    expect(next?.kind).toBe("streaming")
    expect(next?.kind === "streaming" ? next.estimatedTokens : 0).toBeGreaterThan(
      first?.kind === "streaming" ? first.estimatedTokens : 0,
    )

    // Tool status also changes inside the same message object and must replace the activity label.
    setState("messages", 1, "content", 1, {
      type: "tool",
      id: "tool1",
      name: "bash",
      state: { status: "running", input: { command: "pwd" }, metadata: {} },
      time: { created: started, ran: started },
    } as Part)
    expect(state.messages[1]).toBe(step)
    expect(glance.activity()).toMatchObject({ kind: "tool", name: "bash" })

    dispose()
  })
})
