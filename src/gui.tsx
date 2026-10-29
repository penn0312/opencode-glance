import { Command, Plugin, Slot, Style } from "@opencode/plugin/gui"
import { createSignal } from "solid-js"
import { GlanceBar } from "./gui/glance"
import { css } from "./gui/styles"
import { messages } from "./i18n"

export default Plugin.define({
  i18n: messages,
  setup(ctx) {
    const [visible, setVisible] = createSignal(ctx.options.show !== false)

    // Keep the slot object stable so toggling visibility adds or removes the same contribution
    // instead of remounting it on every reactive pass.
    const bar = {
      at: "window.bottom" as const,
      order: 0,
      render: () => <GlanceBar ctx={ctx} />,
    }

    ctx.add(Style, css)
    ctx.add(Slot, () => (visible() ? bar : undefined))
    ctx.add(Command, () => ({
      id: "toggle",
      title: ctx.t("glance.command.toggle"),
      group: ctx.t("glance.command.group"),
      run: () => {
        setVisible((value) => !value)
      },
    }))
  },
})
