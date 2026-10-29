import { createEffect, createMemo, createSignal, onCleanup, Show } from "solid-js"
import type { Context } from "@opencode/plugin/gui"
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
} from "../shared/metrics"

type RateMode = "auto" | "average" | "last"

function shortName(name: string, length = 18): string {
  return name.length > length ? `${name.slice(0, length - 1)}…` : name
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8l2.4 1.5" />
    </svg>
  )
}

function DatabaseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <ellipse cx="8" cy="4.3" rx="5" ry="2.1" />
      <path d="M3 4.3v7.4c0 1.2 2.2 2.1 5 2.1s5-.9 5-2.1V4.3" />
      <path d="M3 8c0 1.2 2.2 2.1 5 2.1s5-.9 5-2.1" />
    </svg>
  )
}

function Ring(props: { percent?: number }) {
  const degree = () => Math.max(0, Math.min(100, props.percent ?? 0)) * 3.6
  return (
    <span
      class="glance-ring"
      style={{
        background: `conic-gradient(currentColor ${degree()}deg, var(--v2-background-bg-layer-04) 0)`,
      }}
      aria-hidden="true"
    />
  )
}

export function GlanceBar(props: { ctx: Context }) {
  const ctx = props.ctx
  const session = () => ctx.sessions.current()

  const messages = createMemo(() => {
    const current = session()
    return current?.id ? current.server.data.session.message.list(current.id) : []
  })

  const info = createMemo(() => {
    const current = session()
    return current?.id ? current.server.data.session.get(current.id) : undefined
  })

  const family = createMemo(() => {
    const current = session()
    if (!current?.id) return []
    const ids = current.server.data.session.family(current.id)
    return ids.length ? ids : [current.id]
  })

  const totals = createMemo(() => {
    const current = session()
    if (!current) return EMPTY_TOKENS
    return family().reduce(
      (total, id) => addTokens(total, current.server.data.session.get(id)?.tokens),
      EMPTY_TOKENS,
    )
  })

  const models = createMemo(() => {
    const current = session()
    return current ? current.server.data.location.model.list(current.location) : undefined
  })

  const usage = createMemo(() => contextUsage(messages(), models(), info()?.revert?.messageID))
  const turns = createMemo(() => countTurns(messages()))
  const stepsMode = ctx.options.steps === "tool" ? "tool" : "assistant"
  const steps = createMemo(() => countSteps(messages(), stepsMode))
  const averageRate = createMemo(() => throughput(messages()))
  const latestRate = createMemo(() => lastThroughput(messages()))
  const hit = createMemo(() => cacheHit(totals()))
  const rateMode: RateMode =
    ctx.options.rate === "average" || ctx.options.rate === "last" ? ctx.options.rate : "auto"

  const running = createMemo(() => {
    const current = session()
    return current?.id ? current.server.data.session.status(current.id) === "running" : false
  })

  const [now, setNow] = createSignal(Date.now())
  const [live, setLive] = createSignal<number>()

  const active = createMemo(() => activeStep(messages()))
  const estimated = createMemo(() => {
    const step = active()
    return step ? estimateStepTokens(step) : 0
  })
  const activity = createMemo(() => stepActivity(active(), estimated(), now()))

  // Only tick while the session runs; this drives the live tool/step elapsed label.
  createEffect(() => {
    if (!running()) return
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 1_000)
    onCleanup(() => clearInterval(timer))
  })

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
    if (rateMode === "average") return averageRate()
    if (rateMode === "last") return latestRate() ?? averageRate()
    return latestRate() ?? averageRate()
  })

  const turnsText = createMemo(
    () => `${ctx.plural("glance.turn", turns())} ${ctx.plural("glance.step", steps())}`,
  )
  const tokensText = createMemo(() => ctx.t("glance.tokens", { tokens: compactNumber(totalTokens(totals())) }))
  const cacheText = createMemo(() => {
    const value = hit()
    return value === undefined ? undefined : ctx.t("glance.cache", { percent: value })
  })
  const contextText = createMemo(() => {
    const value = usage()?.percent
    return value === undefined ? "—" : ctx.t("glance.context", { percent: value })
  })

  const activityText = createMemo(() => {
    const current = activity()
    if (!running()) {
      const value = speed()
      return value === undefined ? undefined : ctx.t("glance.rate", { rate: value })
    }
    if (!current) return ctx.t("glance.preparing")
    if (current.kind === "tool")
      return ctx.t("glance.tool", { name: shortName(current.name), elapsed: formatDuration(current.elapsed) })
    if (current.kind === "waiting")
      return ctx.t("glance.waiting", { elapsed: formatDuration(current.elapsed) })
    const elapsed = formatDuration(current.elapsed)
    if (rateMode === "auto" && live() !== undefined)
      return ctx.t("glance.live", { rate: live()!, elapsed })
    const exact = rateMode === "average" ? averageRate() : latestRate() ?? averageRate()
    return exact === undefined
      ? ctx.t("glance.streaming", { elapsed })
      : ctx.t("glance.rateElapsed", { rate: exact, elapsed })
  })

  const progressText = createMemo(() =>
    activityText() ? `${turnsText()} · ${activityText()}` : turnsText(),
  )
  const usageText = createMemo(() => (cacheText() ? `${tokensText()} · ${cacheText()}` : tokensText()))


  return (
    <Show when={session()}>
      <div class="glance-root">
        <div
          class="glance-bar"
          role="status"
          aria-label={`${progressText()} · ${usageText()} · ${contextText()}`}
          title={`${totalTokens(totals()).toLocaleString()} tokens · ${(
            usage()?.tokens ?? 0
          ).toLocaleString()} in context`}
        >
          <span class="glance-group">
            <span class="glance-icon">
              <ClockIcon />
            </span>
            <span class="glance-label">{progressText()}</span>
          </span>
          <span class="glance-group center">
            <span class="glance-icon">
              <DatabaseIcon />
            </span>
            <span class="glance-label">{usageText()}</span>
          </span>
          <span class="glance-group end">
            <Ring percent={usage()?.percent} />
            <span class="glance-label">{contextText()}</span>
          </span>
        </div>
      </div>
    </Show>
  )
}
