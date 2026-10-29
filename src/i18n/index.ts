const en = {
  "glance.turn.one": "{{count}} turn",
  "glance.turn.other": "{{count}} turns",
  "glance.step.one": "{{count}} step",
  "glance.step.other": "{{count}} steps",
  "glance.rate": "{{rate}} tok/s",
  "glance.rateElapsed": "{{rate}} tok/s · {{elapsed}}",
  "glance.live": "~{{rate}} tok/s · {{elapsed}}",
  "glance.tokens": "{{tokens}} tok",
  "glance.cache": "cache hit {{percent}}%",
  "glance.context": "{{percent}}%",
  "glance.tool": "{{name}} {{elapsed}}",
  "glance.waiting": "waiting {{elapsed}}",
  "glance.streaming": "generating {{elapsed}}",
  "glance.preparing": "preparing",
  "glance.command.toggle": "Glance: toggle status bar",
  "glance.command.group": "Glance",
} as const

export type MessageKey = keyof typeof en
export type Catalog = Record<MessageKey, string>
export type Locale = "en" | "zh" | "zht" | "ja" | "ko" | "de" | "fr" | "es" | "pt" | "it"

export const locales: readonly Locale[] = ["en", "zh", "zht", "ja", "ko", "de", "fr", "es", "pt", "it"]

const zh: Catalog = {
  "glance.turn.one": "{{count}} 轮",
  "glance.turn.other": "{{count}} 轮",
  "glance.step.one": "{{count}} 步",
  "glance.step.other": "{{count}} 步",
  "glance.rate": "{{rate}} tok/s",
  "glance.rateElapsed": "{{rate}} tok/s · {{elapsed}}",
  "glance.live": "~{{rate}} tok/s · {{elapsed}}",
  "glance.tokens": "{{tokens}} tok",
  "glance.cache": "缓存命中 {{percent}}%",
  "glance.context": "{{percent}}%",
  "glance.tool": "{{name}} {{elapsed}}",
  "glance.waiting": "等待响应 {{elapsed}}",
  "glance.streaming": "生成中 {{elapsed}}",
  "glance.preparing": "准备中",
  "glance.command.toggle": "Glance：显示/隐藏状态条",
  "glance.command.group": "Glance",
}

const zht: Catalog = {
  "glance.turn.one": "{{count}} 輪",
  "glance.turn.other": "{{count}} 輪",
  "glance.step.one": "{{count}} 步",
  "glance.step.other": "{{count}} 步",
  "glance.rate": "{{rate}} tok/s",
  "glance.rateElapsed": "{{rate}} tok/s · {{elapsed}}",
  "glance.live": "~{{rate}} tok/s · {{elapsed}}",
  "glance.tokens": "{{tokens}} tok",
  "glance.cache": "快取命中 {{percent}}%",
  "glance.context": "{{percent}}%",
  "glance.tool": "{{name}} {{elapsed}}",
  "glance.waiting": "等待回應 {{elapsed}}",
  "glance.streaming": "生成中 {{elapsed}}",
  "glance.preparing": "準備中",
  "glance.command.toggle": "Glance：顯示/隱藏狀態列",
  "glance.command.group": "Glance",
}

const ja: Catalog = {
  "glance.turn.one": "{{count}} ターン",
  "glance.turn.other": "{{count}} ターン",
  "glance.step.one": "{{count}} ステップ",
  "glance.step.other": "{{count}} ステップ",
  "glance.rate": "{{rate}} tok/s",
  "glance.rateElapsed": "{{rate}} tok/s · {{elapsed}}",
  "glance.live": "~{{rate}} tok/s · {{elapsed}}",
  "glance.tokens": "{{tokens}} tok",
  "glance.cache": "キャッシュヒット {{percent}}%",
  "glance.context": "{{percent}}%",
  "glance.tool": "{{name}} {{elapsed}}",
  "glance.waiting": "応答待ち {{elapsed}}",
  "glance.streaming": "生成中 {{elapsed}}",
  "glance.preparing": "準備中",
  "glance.command.toggle": "Glance：ステータスバーを表示/非表示",
  "glance.command.group": "Glance",
}

const ko: Catalog = {
  "glance.turn.one": "{{count}}턴",
  "glance.turn.other": "{{count}}턴",
  "glance.step.one": "{{count}}단계",
  "glance.step.other": "{{count}}단계",
  "glance.rate": "{{rate}} tok/s",
  "glance.rateElapsed": "{{rate}} tok/s · {{elapsed}}",
  "glance.live": "~{{rate}} tok/s · {{elapsed}}",
  "glance.tokens": "{{tokens}} tok",
  "glance.cache": "캐시 적중 {{percent}}%",
  "glance.context": "{{percent}}%",
  "glance.tool": "{{name}} {{elapsed}}",
  "glance.waiting": "응답 대기 {{elapsed}}",
  "glance.streaming": "생성 중 {{elapsed}}",
  "glance.preparing": "준비 중",
  "glance.command.toggle": "Glance: 상태 표시줄 표시/숨기기",
  "glance.command.group": "Glance",
}

const de: Catalog = {
  "glance.turn.one": "{{count}} Zug",
  "glance.turn.other": "{{count}} Züge",
  "glance.step.one": "{{count}} Schritt",
  "glance.step.other": "{{count}} Schritte",
  "glance.rate": "{{rate}} tok/s",
  "glance.rateElapsed": "{{rate}} tok/s · {{elapsed}}",
  "glance.live": "~{{rate}} tok/s · {{elapsed}}",
  "glance.tokens": "{{tokens}} tok",
  "glance.cache": "Cache-Treffer {{percent}}%",
  "glance.context": "{{percent}}%",
  "glance.tool": "{{name}} {{elapsed}}",
  "glance.waiting": "warte auf Antwort {{elapsed}}",
  "glance.streaming": "generiert {{elapsed}}",
  "glance.preparing": "bereit",
  "glance.command.toggle": "Glance: Statusleiste ein-/ausblenden",
  "glance.command.group": "Glance",
}

const fr: Catalog = {
  "glance.turn.one": "{{count}} tour",
  "glance.turn.other": "{{count}} tours",
  "glance.step.one": "{{count}} étape",
  "glance.step.other": "{{count}} étapes",
  "glance.rate": "{{rate}} tok/s",
  "glance.rateElapsed": "{{rate}} tok/s · {{elapsed}}",
  "glance.live": "~{{rate}} tok/s · {{elapsed}}",
  "glance.tokens": "{{tokens}} tok",
  "glance.cache": "cache {{percent}}%",
  "glance.context": "{{percent}}%",
  "glance.tool": "{{name}} {{elapsed}}",
  "glance.waiting": "en attente de réponse {{elapsed}}",
  "glance.streaming": "génération {{elapsed}}",
  "glance.preparing": "préparation",
  "glance.command.toggle": "Glance : afficher/masquer la barre d’état",
  "glance.command.group": "Glance",
}

const es: Catalog = {
  "glance.turn.one": "{{count}} turno",
  "glance.turn.other": "{{count}} turnos",
  "glance.step.one": "{{count}} paso",
  "glance.step.other": "{{count}} pasos",
  "glance.rate": "{{rate}} tok/s",
  "glance.rateElapsed": "{{rate}} tok/s · {{elapsed}}",
  "glance.live": "~{{rate}} tok/s · {{elapsed}}",
  "glance.tokens": "{{tokens}} tok",
  "glance.cache": "aciertos de caché {{percent}}%",
  "glance.context": "{{percent}}%",
  "glance.tool": "{{name}} {{elapsed}}",
  "glance.waiting": "esperando respuesta {{elapsed}}",
  "glance.streaming": "generando {{elapsed}}",
  "glance.preparing": "preparando",
  "glance.command.toggle": "Glance: mostrar/ocultar la barra de estado",
  "glance.command.group": "Glance",
}

const pt: Catalog = {
  "glance.turn.one": "{{count}} turno",
  "glance.turn.other": "{{count}} turnos",
  "glance.step.one": "{{count}} passo",
  "glance.step.other": "{{count}} passos",
  "glance.rate": "{{rate}} tok/s",
  "glance.rateElapsed": "{{rate}} tok/s · {{elapsed}}",
  "glance.live": "~{{rate}} tok/s · {{elapsed}}",
  "glance.tokens": "{{tokens}} tok",
  "glance.cache": "acertos de cache {{percent}}%",
  "glance.context": "{{percent}}%",
  "glance.tool": "{{name}} {{elapsed}}",
  "glance.waiting": "aguardando resposta {{elapsed}}",
  "glance.streaming": "gerando {{elapsed}}",
  "glance.preparing": "preparando",
  "glance.command.toggle": "Glance: mostrar/ocultar a barra de status",
  "glance.command.group": "Glance",
}

const it: Catalog = {
  "glance.turn.one": "{{count}} turno",
  "glance.turn.other": "{{count}} turni",
  "glance.step.one": "{{count}} passo",
  "glance.step.other": "{{count}} passi",
  "glance.rate": "{{rate}} tok/s",
  "glance.rateElapsed": "{{rate}} tok/s · {{elapsed}}",
  "glance.live": "~{{rate}} tok/s · {{elapsed}}",
  "glance.tokens": "{{tokens}} tok",
  "glance.cache": "hit cache {{percent}}%",
  "glance.context": "{{percent}}%",
  "glance.tool": "{{name}} {{elapsed}}",
  "glance.waiting": "in attesa di risposta {{elapsed}}",
  "glance.streaming": "generazione {{elapsed}}",
  "glance.preparing": "preparazione",
  "glance.command.toggle": "Glance: mostra/nascondi la barra di stato",
  "glance.command.group": "Glance",
}

export const messages: Record<Locale, Catalog> = { en, zh, zht, ja, ko, de, fr, es, pt, it }

export type Params = Record<string, string | number | boolean>

/** Replaces {{name}} placeholders; unknown placeholders become empty strings. */
export function translate(locale: Locale, key: MessageKey, params?: Params): string {
  const template = messages[locale]?.[key] ?? messages.en[key]
  if (!params) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(params[name] ?? ""))
}

/** Plural form for a count, using the locale's categories and falling back to `.other`. */
export function plural(locale: Locale, base: "glance.turn" | "glance.step", count: number): string {
  const category = new Intl.PluralRules(locale === "zht" ? "zh-TW" : locale).select(count)
  const key = `${base}.${category}` as MessageKey
  const resolved = Object.hasOwn(messages.en, key) ? key : (`${base}.other` as MessageKey)
  return translate(locale, resolved, { count })
}

function matchLocale(tag: string): Locale {
  const lower = tag.toLowerCase()
  if (lower.includes("hant") || lower.startsWith("zh-tw") || lower.startsWith("zh-hk")) return "zht"
  const base = lower.split("-")[0]
  return (locales.includes(base as Locale) ? base : "en") as Locale
}

/** Resolves an explicit locale, or the system locale for "auto"/undefined. */
export function resolveLocale(value: unknown): Locale {
  if (value === undefined || value === "auto") {
    return matchLocale(Intl.DateTimeFormat().resolvedOptions().locale)
  }
  if (typeof value !== "string") return "en"
  const lower = value.toLowerCase()
  if (lower === "zht" || lower === "zh-tw" || lower === "zh-hk" || lower === "zh-hant") return "zht"
  const base = lower.split("-")[0]
  return locales.includes(base as Locale) ? (base as Locale) : "en"
}
