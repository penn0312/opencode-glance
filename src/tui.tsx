/** @jsxImportSource @opentui/solid */
import { Plugin } from "@opencode/plugin/tui"
import type { BoxRenderable } from "@opentui/core"
import { createEffect, createMemo, createSignal, onCleanup, Show } from "solid-js"
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
} from "./shared/metrics"

import { plural, resolveLocale, translate, type Locale, type MessageKey, type Params } from "./i18n"

type RateMode = "auto" | "average" | "last"

function resolveRate(value: unknown): RateMode {
  if (value === "average" || value === "last" || value === "auto") return value
  return "auto"
}

function shortName(name: string, length = 18): string {
  return name.length > length ? `${name.slice(0, length - 1)}…` : name
}


function GlanceBar(props: {
  context: Plugin.Context
  sessionID: string
  locale: Locale
  icons: boolean
  stepsMode: "assistant" | "tool"
  rate: RateMode
}) {
  const theme = props.context.theme
  const t = (key: MessageKey, params?: Params) => translate(props.locale, key, params)
  const [barWidth, setBarWidth] = createSignal(0)
  const [now, setNow] = createSignal(Date.now())
  const [live, setLive] = createSignal<number>()

  const session = createMemo(() => props.context.data.session.get(props.sessionID))
  const messages = createMemo(() => props.context.data.session.message.list(props.sessionID))
  const running = createMemo(() => props.context.data.session.status(props.sessionID) === "running")
  const family = createMemo(() => {
    const ids = props.context.data.session.family(props.sessionID)
    return ids.length ? ids : [props.sessionID]
  })
  const totals = createMemo(() =>
    family().reduce(
      (total, id) => addTokens(total, props.context.data.session.get(id)?.tokens),
      EMPTY_TOKENS,
    ),
  )
  const models = createMemo(() =>
    props.context.data.location.model.list(session()?.location ?? props.context.location),
  )

  const usage = createMemo(() =>
    contextUsage(messages(), models(), session()?.revert?.messageID),
  )
  const turns = createMemo(() => countTurns(messages()))
  const steps = createMemo(() => countSteps(messages(), props.stepsMode))
  const averageRate = createMemo(() => throughput(messages()))
  const latestRate = createMemo(() => lastThroughput(messages()))
  const hit = createMemo(() => cacheHit(totals()))

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
    if (props.rate === "average") return averageRate()
    if (props.rate === "last") return latestRate() ?? averageRate()
    return latestRate() ?? averageRate()
  })

  const turnText = createMemo(
    () => `${plural(props.locale, "glance.turn", turns())} ${plural(props.locale, "glance.step", steps())}`,
  )
  const tokensText = createMemo(() => t("glance.tokens", { tokens: compactNumber(totalTokens(totals())) }))
  const cacheText = createMemo(() => {
    const value = hit()
    return value === undefined ? undefined : t("glance.cache", { percent: value })
  })
  const contextText = createMemo(() => {
    const value = usage()?.percent
    return value === undefined ? "—" : t("glance.context", { percent: value })
  })

  const activityText = createMemo(() => {
    const current = activity()
    if (!running()) {
      const value = speed()
      return value === undefined ? undefined : t("glance.rate", { rate: value })
    }
    if (!current) return t("glance.preparing")
    if (current.kind === "tool")
      return t("glance.tool", { name: shortName(current.name), elapsed: formatDuration(current.elapsed) })
    if (current.kind === "waiting") return t("glance.waiting", { elapsed: formatDuration(current.elapsed) })
    const elapsed = formatDuration(current.elapsed)
    if (props.rate === "auto" && live() !== undefined) return t("glance.live", { rate: live()!, elapsed })
    const exact = props.rate === "average" ? averageRate() : latestRate() ?? averageRate()
    return exact === undefined ? t("glance.streaming", { elapsed }) : t("glance.rateElapsed", { rate: exact, elapsed })
  })

  const progress = createMemo(() => (activityText() ? `${turnText()} · ${activityText()}` : turnText()))
  const usageText = createMemo(() => (cacheText() ? `${tokensText()} · ${cacheText()}` : tokensText()))
  const compactText = createMemo(() => `${turns()}/${steps()} · ${contextText()}`)
  const mediumText = createMemo(() =>
    running()
      ? [turnText(), activityText(), tokensText(), contextText()].filter((part) => part !== undefined).join(" · ")
      : [turnText(), activityText(), tokensText(), cacheText(), contextText()]
          .filter((part) => part !== undefined)
          .join(" · "),
  )
  const layout = createMemo(() =>
    barWidth() >= 94 ? "full" : barWidth() >= 64 ? "medium" : "compact",
  )

  const Clock = () =>
    props.icons ? <span style={{ fg: theme.text.muted }}>◷ </span> : null
  const Database = () =>
    props.icons ? <span style={{ fg: theme.text.muted }}>▤ </span> : null
  const Progress = () =>
    props.icons ? <span style={{ fg: theme.text.muted }}>◔ </span> : null

  return (
    <box
      border
      borderStyle="rounded"
      borderColor={theme.border.base}
      backgroundColor={theme.background.raised.base}
      marginBottom={1}
      paddingLeft={2}
      paddingRight={2}
      flexDirection="row"
      justifyContent="space-between"
      gap={2}
      onSizeChange={function (this: BoxRenderable) {
        setBarWidth(this.width)
      }}
    >
      <Show
        when={layout() === "full"}
        fallback={
          <text fg={theme.text.base} wrapMode="none">
            {layout() === "medium" ? mediumText() : compactText()}
          </text>
        }
      >
        <text fg={theme.text.base} wrapMode="none">
          <Clock />
          {progress()}
        </text>
        <text fg={theme.text.base} wrapMode="none">
          <Database />
          {usageText()}
        </text>
        <text fg={theme.text.base} wrapMode="none">
          <Progress />
          {contextText()}
        </text>
      </Show>
    </box>
  )
}

export default Plugin.define({
  id: "opencode-glance.tui",
  setup(context) {
    const locale = resolveLocale(context.options.locale)
    const [state, update] = context.storage.memory("opencode-glance", {
      initial: { visible: context.options.show !== false },
    })

    context.ui.slot({
      append: "session.composer.top",
      render: ({ sessionID }) => (
        <Show when={state.visible}>
          <GlanceBar
            context={context}
            sessionID={sessionID}
            locale={locale}
            icons={context.options.icons !== false}
            stepsMode={context.options.steps === "tool" ? "tool" : "assistant"}
            rate={resolveRate(context.options.rate)}
          />
        </Show>
      ),
    })

    context.keymap.layer(() => ({
      mode: "global",
      commands: [
        {
          id: "opencode-glance.toggle",
          title: translate(locale, "glance.command.toggle"),
          palette: true,
          run: () =>
            update((draft) => {
              draft.visible = !draft.visible
            }),
        },
      ],
    }))
  },
})
