/** @jsxImportSource @opentui/solid */
import { Plugin } from "@opencode/plugin/tui"
import type { BoxRenderable } from "@opentui/core"
import { createSignal, Show } from "solid-js"
import { createGlance, resolveRate, resolveSteps, type RateMode, type StepsMode } from "./shared/glance"

import { plural, resolveLocale, translate, type Locale, type MessageKey, type Params } from "./i18n"

function GlanceBar(props: {
  context: Plugin.Context
  sessionID: string
  locale: Locale
  icons: boolean
  stepsMode: StepsMode
  rate: RateMode
}) {
  const theme = props.context.theme
  const t = (key: MessageKey, params?: Params) => translate(props.locale, key, params)
  // A terminal does not always report its size before the first layout pass; starting from the real
  // column count keeps the first frame in the full layout instead of flashing the compact one.
  const [barWidth, setBarWidth] = createSignal(process.stdout?.columns ?? 0)

  const glance = createGlance(
    {
      messages: () => props.context.data.session.message.list(props.sessionID),
      session: () => props.context.data.session.get(props.sessionID),
      family: () => {
        const ids = props.context.data.session.family(props.sessionID)
        return ids.length ? ids : [props.sessionID]
      },
      sessionTokens: (id) => props.context.data.session.get(id)?.tokens,
      models: () =>
        props.context.data.location.model.list(
          props.context.data.session.get(props.sessionID)?.location ?? props.context.location,
        ),
      running: () => props.context.data.session.status(props.sessionID) === "running",
    },
    {
      steps: props.stepsMode,
      rate: props.rate,
      t,
      plural: (base, count) => plural(props.locale, base, count),
    },
  )

  const layout = () => (barWidth() >= 94 ? "full" : barWidth() >= 64 ? "medium" : "compact")

  const Clock = () => (props.icons ? <span style={{ fg: theme.text.muted }}>◷ </span> : null)
  const Database = () => (props.icons ? <span style={{ fg: theme.text.muted }}>▤ </span> : null)
  const Progress = () => (props.icons ? <span style={{ fg: theme.text.muted }}>◔ </span> : null)

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
            {layout() === "medium" ? glance.mediumText() : glance.compactText()}
          </text>
        }
      >
        <text fg={theme.text.base} wrapMode="none">
          <Clock />
          {glance.progressText()}
        </text>
        <text fg={theme.text.base} wrapMode="none">
          <Database />
          {glance.usageText()}
        </text>
        <text fg={theme.text.base} wrapMode="none">
          <Progress />
          {glance.contextText()}
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
            stepsMode={resolveSteps(context.options.steps)}
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
