"use client"

import React from "react"
import * as Lucide from "lucide-react"

export interface EmojiConfig {
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  color?: string
}

const GithubIcon = ({ size = 13, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) => (
  <svg
    height={size}
    width={size}
    viewBox="0 0 16 16"
    version="1.1"
    aria-hidden="true"
    fill="currentColor"
    className={className}
    style={style}
  >
    <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
)

// Slack emoji shortcodes → Lucide icons with cohesive colors
export const EMOJI_MAP: Record<string, EmojiConfig> = {
  rotating_light: { icon: Lucide.AlertCircle, color: "var(--status-error)" },
  white_check_mark: { icon: Lucide.CheckCircle2, color: "var(--status-success)" },
  mag: { icon: Lucide.Search, color: "var(--accent)" },
  thumbsdown: { icon: Lucide.ThumbsDown, color: "var(--status-error)" },
  thumbsup: { icon: Lucide.ThumbsUp, color: "var(--status-success)" },
  warning: { icon: Lucide.AlertTriangle, color: "var(--status-warning)" },
  eyes: { icon: Lucide.Eye, color: "var(--text-secondary)" },
  red_circle: { icon: Lucide.Circle, color: "var(--status-error)" },
  large_orange_circle: { icon: Lucide.Circle, color: "var(--status-warning)" },
  large_yellow_circle: { icon: Lucide.Circle, color: "color-mix(in oklch, var(--status-warning) 80%, var(--text-primary))" },
  green_circle: { icon: Lucide.Circle, color: "var(--status-success)" },
  clock3: { icon: Lucide.Clock, color: "var(--text-tertiary)" },
  github: { icon: GithubIcon, color: "var(--text-primary)" },
  x: { icon: Lucide.XCircle, color: "var(--status-error)" },
  heavy_check_mark: { icon: Lucide.CheckCircle2, color: "var(--status-success)" },
  information_source: { icon: Lucide.Info, color: "var(--accent)" },
  bulb: { icon: Lucide.Lightbulb, color: "var(--status-warning)" },
  fire: { icon: Lucide.Flame, color: "var(--status-error)" },
  memo: { icon: Lucide.FileText, color: "var(--text-secondary)" },
  chart_with_upwards_trend: { icon: Lucide.TrendingUp, color: "var(--status-success)" },
  chart_with_downwards_trend: { icon: Lucide.TrendingDown, color: "var(--status-error)" },
  tada: { icon: Lucide.PartyPopper, color: "var(--accent)" },
  sos: { icon: Lucide.AlertCircle, color: "var(--status-error)" },
  rocket: { icon: Lucide.Rocket, color: "var(--accent)" },
  bug: { icon: Lucide.Bug, color: "var(--status-error)" },
  hammer: { icon: Lucide.Hammer, color: "var(--text-secondary)" },
  wrench: { icon: Lucide.Wrench, color: "var(--text-secondary)" },
  link: { icon: Lucide.Link2, color: "var(--accent)" },
  lock: { icon: Lucide.Lock, color: "var(--status-error)" },
  unlock: { icon: Lucide.Unlock, color: "var(--status-success)" },
  key: { icon: Lucide.Key, color: "var(--status-warning)" },
  bell: { icon: Lucide.Bell, color: "var(--text-secondary)" },
  mute: { icon: Lucide.BellOff, color: "var(--text-tertiary)" },
  speech_balloon: { icon: Lucide.MessageSquare, color: "var(--text-secondary)" },
  thought_balloon: { icon: Lucide.MessageSquare, color: "var(--text-tertiary)" },
}

type Token =
  | { kind: "text"; value: string }
  | { kind: "bold"; children: Token[] }
  | { kind: "italic"; children: Token[] }
  | { kind: "code"; value: string }
  | { kind: "codeblock"; value: string; lang?: string }
  | { kind: "link"; url: string; label: string }
  | { kind: "emoji"; name: string }
  | { kind: "blockquote"; children: Token[] }
  | { kind: "newline" }

/** Tokenize Slack mrkdwn text into a token array */
function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < input.length) {
    // Code fence ``` ... ```
    if (input.startsWith("```", i)) {
      const end = input.indexOf("```", i + 3)
      if (end !== -1) {
        const raw = input.slice(i + 3, end)
        // Optionally strip leading language hint on first line
        const newlineIdx = raw.indexOf("\n")
        let lang: string | undefined
        let code = raw
        if (newlineIdx !== -1 && raw.slice(0, newlineIdx).trim().match(/^\w+$/)) {
          lang = raw.slice(0, newlineIdx).trim()
          code = raw.slice(newlineIdx + 1)
        }
        tokens.push({ kind: "codeblock", value: code.replace(/\n$/, ""), lang })
        i = end + 3
        continue
      }
    }

    // Inline code `...`
    if (input[i] === "`") {
      const end = input.indexOf("`", i + 1)
      if (end !== -1) {
        tokens.push({ kind: "code", value: input.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }

    // Bold *...*
    if (input[i] === "*") {
      const end = input.indexOf("*", i + 1)
      if (end !== -1) {
        const inner = input.slice(i + 1, end)
        tokens.push({ kind: "bold", children: tokenize(inner) })
        i = end + 1
        continue
      }
    }

    // Italic _..._
    if (input[i] === "_") {
      const end = input.indexOf("_", i + 1)
      if (end !== -1) {
        const inner = input.slice(i + 1, end)
        tokens.push({ kind: "italic", children: tokenize(inner) })
        i = end + 1
        continue
      }
    }

    // Link <url|label> or <url>
    if (input[i] === "<") {
      const end = input.indexOf(">", i + 1)
      if (end !== -1) {
        const inner = input.slice(i + 1, end)
        const pipeIdx = inner.indexOf("|")
        if (pipeIdx !== -1) {
          tokens.push({
            kind: "link",
            url: inner.slice(0, pipeIdx),
            label: inner.slice(pipeIdx + 1),
          })
        } else {
          tokens.push({ kind: "link", url: inner, label: inner })
        }
        i = end + 1
        continue
      }
    }

    // Emoji :name:
    if (input[i] === ":") {
      const end = input.indexOf(":", i + 1)
      if (end !== -1 && end - i <= 30) {
        const name = input.slice(i + 1, end)
        if (/^[\w_]+$/.test(name)) {
          tokens.push({ kind: "emoji", name })
          i = end + 1
          continue
        }
      }
    }

    // Blockquote > at start of line
    if (input[i] === ">" && (i === 0 || input[i - 1] === "\n")) {
      let j = i + 1
      if (input[j] === " ") j++
      let lineEnd = input.indexOf("\n", j)
      if (lineEnd === -1) lineEnd = input.length
      const lineText = input.slice(j, lineEnd)
      tokens.push({ kind: "blockquote", children: tokenize(lineText) })
      i = lineEnd
      continue
    }

    // Explicit \\n newline sequences in JSON strings
    if (input[i] === "\\" && input[i + 1] === "n") {
      tokens.push({ kind: "newline" })
      i += 2
      continue
    }

    // Real newline
    if (input[i] === "\n") {
      tokens.push({ kind: "newline" })
      i++
      continue
    }

    // Plain text — accumulate until a special char
    let j = i
    while (j < input.length) {
      const c = input[j]
      if (
        c === "*" ||
        c === "_" ||
        c === "`" ||
        c === "<" ||
        c === ":" ||
        c === "\n" ||
        (c === ">" && (j === 0 || input[j - 1] === "\n")) ||
        (c === "\\" && input[j + 1] === "n")
      ) {
        break
      }
      j++
    }
    if (j > i) {
      tokens.push({ kind: "text", value: input.slice(i, j) })
      i = j
    } else {
      // Safety: advance one character to avoid infinite loop
      tokens.push({ kind: "text", value: input[i] })
      i++
    }
  }

  return tokens
}

let keyCounter = 0
function nextKey() {
  return `mk-${++keyCounter}`
}

function renderTokens(tokens: Token[]): React.ReactNode[] {
  return tokens.map((token) => {
    switch (token.kind) {
      case "text":
        return token.value

      case "newline":
        return <br key={nextKey()} />

      case "bold":
        return (
          <strong key={nextKey()} className="font-semibold text-[--text-primary]">
            {renderTokens(token.children)}
          </strong>
        )

      case "italic":
        return (
          <em key={nextKey()} className="italic text-[--text-secondary]">
            {renderTokens(token.children)}
          </em>
        )

      case "code":
        return (
          <code
            key={nextKey()}
            className="rounded bg-[--surface-3] px-1 py-0.5 font-mono text-[0.82em] text-[--text-primary]"
          >
            {token.value}
          </code>
        )

      case "codeblock":
        return (
          <pre
            key={nextKey()}
            className="my-2 overflow-x-auto rounded-md bg-[--surface-3] p-3 font-mono text-xs leading-relaxed text-[--text-primary]"
          >
            <code>{token.value}</code>
          </pre>
        )

      case "link":
        return (
          <a
            key={nextKey()}
            href={token.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[--accent] underline-offset-2 hover:underline"
          >
            {token.label}
          </a>
        )

      case "emoji": {
        const cfg = EMOJI_MAP[token.name]
        if (cfg) {
          const IconComponent = cfg.icon
          return (
            <IconComponent
              key={nextKey()}
              size={13}
              className="inline-block align-text-bottom mx-0.5"
              style={{ color: cfg.color }}
            />
          )
        }
        return (
          <span key={nextKey()} className="text-[--text-tertiary]">
            :{token.name}:
          </span>
        )
      }

      case "blockquote":
        return (
          <blockquote
            key={nextKey()}
            className="my-1 border-l-2 border-[--border] pl-2.5 text-[--text-secondary] italic"
          >
            {renderTokens(token.children)}
          </blockquote>
        )

      default:
        return null
    }
  })
}

interface MrkdwnProps {
  text: string
  className?: string
}

/** Renders Slack mrkdwn text as React elements */
export function Mrkdwn({ text, className }: MrkdwnProps) {
  const tokens = tokenize(text)
  const nodes = renderTokens(tokens)

  return (
    <span className={className}>
      {nodes}
    </span>
  )
}
