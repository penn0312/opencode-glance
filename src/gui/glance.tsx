import { Show } from "solid-js"
import type { Context } from "@opencode/plugin/gui"
import { createGlance, resolveRate, resolveSteps } from "../shared/glance"
import { totalTokens } from "../shared/metrics"

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

  const glance = createGlance(
    {
      messages: () => {
        const current = session()
        return current?.id ? current.server.data.session.message.list(current.id) : []
      },
      session: () => {
        const current = session()
        return current?.id ? current.server.data.session.get(current.id) : undefined
      },
      family: () => {
        const current = session()
        if (!current?.id) return []
        const ids = current.server.data.session.family(current.id)
        return ids.length ? ids : [current.id]
      },
      sessionTokens: (id) => session()?.server.data.session.get(id)?.tokens,
      models: () => {
        const current = session()
        return current ? current.server.data.location.model.list(current.location) : undefined
      },
      running: () => {
        const current = session()
        return current?.id ? current.server.data.session.status(current.id) === "running" : false
      },
    },
    {
      steps: resolveSteps(ctx.options.steps),
      rate: resolveRate(ctx.options.rate),
      t: (key, params) => ctx.t(key, params),
      plural: (base, count) => ctx.plural(base, count),
    },
  )

  return (
    <Show when={session()}>
      <div class="glance-root">
        <div
          class="glance-bar"
          role="status"
          aria-label={`${glance.progressText()} · ${glance.usageText()} · ${glance.contextText()}`}
          title={`${totalTokens(glance.totals()).toLocaleString()} tokens · ${(
            glance.usage()?.tokens ?? 0
          ).toLocaleString()} in context`}
        >
          <span class="glance-group">
            <span class="glance-icon">
              <ClockIcon />
            </span>
            <span class="glance-label">{glance.progressText()}</span>
          </span>
          <span class="glance-group center">
            <span class="glance-icon">
              <DatabaseIcon />
            </span>
            <span class="glance-label">{glance.usageText()}</span>
          </span>
          <span class="glance-group end">
            <Ring percent={glance.usage()?.percent} />
            <span class="glance-label">{glance.contextText()}</span>
          </span>
        </div>
      </div>
    </Show>
  )
}
