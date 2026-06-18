# LLM Observability Platform

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Overview

**The 4-screen flow:**

1. **Dashboard** - understand the state of your system in 5 seconds
2. **Traces** - browse traces, inspect span trees, debug failures
3. **Slack Card** - view Slack-style alert cards for failed traces
4. **Issues** - track bugs on a Linear-style kanban board

All data comes from two JSON files. Everything is computed and rendered in the browser.

## Stack

### D3

Chose this over Recharts/Chart.js for one reason: **control**. The spec asked for p50/p95 markers on a histogram, custom tooltips, animated line draws with `stroke-dashoffset`, and responsive SVGs. D3 gives ownership over every pixel instead of fighting a charting library.

### sonner

Toast notifications. When you create an issue from a Slack card, a toast with a "View" action button appears. Clean API, respects our CSS variables, auto-dismisses.

### lucide-react + @hugeicons/react

`lucide-react` for general UI (layout, navigation). `hugeicons` for product-specific visuals (bug, alert, activity) where coverage is better.

---

## Notes of given data

- **Running traces** have no `endTime`, no `latencyMs`, and `output: null`. The UI treats them differently - status badge shows "running" with a pulsing dot, latency tables show "-", spans render as collapsed.
- **LLM-specific fields** (`model`, `promptTokens`, `completionTokens`, `costUsd`) only exist on LLM spans. Non-LLM spans (tool, retriever, etc.) are missing these. We display them as empty rather than `0` to avoid implying the value exists.
- **Feedback** exists on some traces only. We render the panel conditionally.
- **The provided Slack alerts** (`slack-cards.json`) only cover 3 of 10+ failed traces. We built `buildFallbackSlackMessage()` to generate synthetic alert cards from any failed trace's error data.
- **External URLs** in pre-defined Slack cards pointed to `https://app.example.com/...`. Instead of sending users outside the product, our fallback cards use local `/traces/{id}` routes.

---

## Typography, Colors & Design Tokens

### Typography

We use three fonts, each with a specific job:

- **GeneralSans** (`--font-general`) - A clean, geometric sans-serif used for all UI text: headings, body copy, buttons, labels.
- **PaperMono** (`--font-paper`) - A monospace font used for data: trace IDs, timestamps, costs, token counts, code blocks, JSON. Its job is to create visual alignment and scannability. When you see PaperMono, you know you're looking at data, not prose.
- **Geist Mono** (`--font-mono-fallback`) - A fallback monospace for system-level mono needs (keyboard shortcuts, inline code). PaperMono takes precedence for data display.

**The separation matters.** When a developer sees a trace ID like `trace_g0116` in PaperMono, they immediately know it's a machine identifier, not a human-readable label. When they see "Trace failed" in GeneralSans, they know it's a human message. This semantic distinction reduces cognitive load.

### Color System

**Dark-first, teal/cyan brand palette.**

The default theme is dark because observability tools are often used in dark environments (developers, ops teams). The dark theme uses a nearly-black background (`#09090b`) so that the accent color pops like a glow.

The light theme is completely separate - not just inverted, but rethought. The light theme uses a pale cyan background (`#e3eaec`) for a clinical feel. The accent stays teal (`#0d7284`) for brand consistency, but the surrounding colors shift to cooler, softer tones.

**5 Surface Layers.**

We have 5 surface layers (bg, surface-1 through surface-5), each slightly lighter than the last. This creates a sense of depth without using shadows:
- `--bg` - page background (deepest)
- `--surface-1` - sidebar, panels
- `--surface-2` - cards, rows
- `--surface-3` - hover, selected
- `--surface-4` - inputs, elevated
- `--surface-5` - toggle active, badges

5, cause that's enough to create depth without confusion.


**Status Colors.**

Status colors are calibrated to be noticeable but not aggressive:
- **Success** (`#34c77b`) - A calm green, not neon. Used for success states, open issues.
- **Error** (`#ef5252`) - A warm red, not aggressive. Used for errors, failed traces.
- **Warning** (`#dfa528`) - An amber, not yellow. Used for warnings, in-progress states.
- **Running** (`#5ad0e0`) - A teal, distinct from the accent. Used for running traces/spans.

Each status has a "muted" variant (10% opacity) for backgrounds, borders, and subtle indicators. This creates a consistent visual language: solid color for foreground, muted for background.

**Span Type Colors.**

Each span type (LLM, tool, chain, retriever, parser) gets its own color. This helps developers quickly identify what kind of span they're looking at in the trace tree:
- LLM: Blue (`#6baae0`)
- Tool: Amber (`#dfa528`)
- Chain: Purple (`#a88add`)
- Retriever: Green (`#34c77b`)
- Parser: Orange (`#e07a4a`)

### View Transitions

Heard about this a while ago, so used **Next.js's experimental View Transitions** (`experimental.viewTransition: true` in `next.config.ts`). Next.js handles the View Transition API setup for us — we just add the CSS to style the crossfade.

When you navigate between pages, the old page fades out (`vt-fade-out`) and the new page fades in (`vt-fade-in`) over 350ms with a `cubic-bezier(0.4, 0, 0.2, 1)` easing. 

Why view transitions? Because they're hardware-accelerated, work at the browser level, and respect `prefers-reduced-motion` (we disable them for users who prefer reduced motion).

### Animations

We use a small set of custom animations, all conservative:
- **fade-in** (180ms) - New elements appearing
- **slide-in-right** (180ms) - Panels sliding in from the right
- **slide-in-up** (160ms) - Modals, sheets, dropdowns
- **pulse-running** (2s) - Running status dots (subtle breathing)

All animations use `ease-out` so they feel responsive (fast start, gentle stop).

**Accessibility:** All animations respect `prefers-reduced-motion`. Users who disable motion get instant transitions instead.

### Scrollbars

Custom thin scrollbars (6px) with subtle colors. They fade into the background but appear on hover. This keeps the UI clean while still providing scroll affordances.

---

# Design Decisions - Deep Dive

## Dashboard

### KPI Cards (`KpiCard.tsx`)

LangSmith and Linear both use this pattern: small, information-dense stat tiles at the top. So we have 5 tiles in a row lets your eye scan left-to-right in one motion. Each tile has a sparkline below the number.The sparkline shows you if that number is going up, down, or flat over the last 7 days.

Then had p50 and p95 on the same tile with a tab toggle instead of two separate tiles (cause latency it's a distribution) Showing both side-by-side would overload the tile. Tabs let the user switch between "typical" (p50) and "worst case" (p95) without crowding. The sparkline updates too, so the trend is for whichever metric you're viewing.

Another small thing Below 1024px, the 5 tiles wrap: `2+2+1` on sm, `3+2` on lg, made the last tile (Total Tokens) span 2 columns via `sm:col-span-2 lg:col-span-2 xl:col-span-1`. Spanning 2 fills the space and gives the bottom row visual weight.

### Latency Distribution Histogram (`LatencyHistogram.tsx`)

Earlier created a "Latency over time" chart (p50/p95 lines across days). Then read the assignment proper and saw it mentioned a histogram.

A time-series answers: _"How did latency change over the 7-day window?"_  
A histogram answers: _"What do my latencies actually look like?"_

For an ops dashboard, the second question is more actionable. A histogram reveals the shape. The p50 and p95 lines are vertical references - they mark where the distribution actually falls, making them meaningful in context.

### Cost by Model Chart (`CostByModelChart.tsx`)

Here rather than simple bars, used Segmented horizontal bars. Each model gets a horizontal bar, but the bar is actually made of **individual SVG rect segments**. Had this cause a segmented bar feels more "digital" and precise It also animates better: segments light up sequentially with a stagger, creating a satisfying reveal.

**Two data columns on desktop, hidden on mobile.**

On desktop (≥450px), the chart shows cost + trace count next to each bar. On mobile, these are hidden - the screen is too narrow. The chart itself remains readable because the model names truncate at 12 chars (vs 19 on desktop). This is a responsive design decision: show what fits, hide what doesn't, keep the core readable.

### Model Breakdown Panel (`ModelBreakdownPanel.tsx`)

**A full data exploration tool, not just a chart.**

This panel combines a data table + a donut chart. A chart shows proportions, and the table shows exact numbers. Together they answer: _"Which models am I using, how much are they costing me, and what proportion of my budget do they eat?"_

**Table: sortable, filterable, selectable.**

- **Search** filters by model name
- **Sort** by any column (Traces, Total cost, Avg tokens) - click header toggles asc/desc
- **Select** rows via checkbox - selected rows filter the donut chart in real-time
- **Color column** - a small colored dot maps to the donut chart color

**Donut chart: 3 metrics.**

Three toggle buttons above the donut: Traces, Total cost, Avg tokens.Toggling reveals these relationships.

**Donut "Other" bucket.**

If there are more than 9 models, the bottom models are grouped into an "Other (N)" bucket. This prevents the donut from becoming an unreadable rainbow of tiny slices. The "Other" bucket is gray (not a model color) to visually distinguish it.

**Row selection → donut sync.**

When you select rows in the table, the donut chart filters to only those models. This is bidirectional: the table controls the chart, and clicking a donut segment selects/deselects the row. It's a lightweight filtering mechanism without needing a separate filter UI.

**Responsive: side-by-side on desktop, stacked on mobile.**

On desktop (≥1024px), table and donut are side-by-side. On mobile, they stack vertically - table above, donut below. The donut's legend (normally visible only on desktop) also appears below the donut on mobile so touch users can still read labels.

### Chart Empty States

Every chart checks `data.length === 0` and renders a specific message: "No latency data in this window", "No error data in this window", etc. Not a generic "No data" - each has its own specific message. Small detail, but it shows the component knows what it's showing.

### Loading Skeleton

`app/dashboard/loading.tsx` provides animated skeleton placeholders for every section (KPIs, charts, model breakdown). Used pulsing animation. The skeleton mirrors the actual layout so nothing jumps when real data arrives.

---

## Traces

### Dual-Panel Architecture

`?id=` for preview, `/[id]` for full-screen. On desktop (≥1024px):

- `/traces?id=trace_g0116` → list panel left, detail panel right. Fast, non-committal. Click another trace, panel swaps. No page reload.
- `/traces/trace_g0116` → full-screen dedicated view. No list panel. Focus mode.

On mobile (<1024px): the preview URL redirects to the full-screen URL because there's no room for dual-panel. If you're on `/traces?id=xxx` on mobile and refresh, the app detects the mobile viewport and navigates to `/traces/xxx` instead.

*The `?id=` preview lets you do that. The `/[id]` URL is for sharing, deep-linking from Slack cards, and bookmarking.*

### Trace Explorer - The List (`TraceExplorer.tsx`)

**Dense table.**

IDs are monospace, numbers are `tabular-nums` so 100ms and 1000ms line up vertically. Status is a 6px dot (green/red/amber) + label - scannable at a glance. Error rows also get a `border-l-2` red accent, so even in peripheral vision you know something is wrong.

**Search + Filter**

Search is client-side via `filter()`,the filter is instant, results appear as you type. Status filter uses pill buttons (not a dropdown) - fewer clicks, faster iteration. Each pill shows a count badge so you know how many traces are in each status.

**Sortable columns.**

Click a column header to sort - Name, Latency, Cost, Time. Toggle direction with repeated clicks. The sort icon (ArrowUp/ArrowDown/ArrowUpDown) gives immediate visual feedback.

**Virtual scrolling (lazy load).**

Only the first 50 traces are rendered initially. On scroll, the next 50 load. This keeps the DOM light even with 50+ traces. 

**Compact vs Spacious toggle.**

Users can switch between compact (tighter, more info per screen) and spacious (more padding, easier reading). This is a user preference - some people like dense data screens, some need breathing room.

### Trace Detail - Span Tree (`TraceDetail.tsx`)

**Recursive tree rendering.**

Spans form a tree (parent/child via `parentId`). We compute a `depth` value server-side, then render with `pl-{depth * 4}` for indentation. Each row is clickable to expand/collapse children. 

**Why show input/output as raw JSON?**

Because this is a developer tool. Developers need to see the _actual_ data that went into a span, not a prettified summary. We format with `JSON.stringify(..., null, 2)` and a `pre` block with the paper font. It's dense, but that's the point - you can copy-paste it, diff it, read it.

**The "View Alert" button.**

Only shows for traces that either (a) have pre-defined Slack cards or (b) are in error status (for which we generate a fallback card). This button links to `/slack/[id]`. 

---

## Slack Alert Card

### Block Kit Renderer (`SlackCardRenderer.tsx`)

We render Slack Block Kit blocks faithfully: `header` (bold title), `context` (muted metadata), `section` (body text + optional 2-col `fields`), `divider`, `actions` (buttons/dropdowns). The text uses Slack's `mrkdwn` format - we parse `*bold*`, `_italic_`, `` `code` ``, and `code fences`.


### Lifecyle Stepper

Some traces have multiple messages (alert → investigating → triage → resolved). We show a stepper at the bottom of the Slack card that lets you navigate between lifecycle stages. Each step is a small dot with the lifecycle name. The active step is highlighted. This is a Linear-style stepper - minimal, scannable, keyboard-friendly, but created in a floating nav kind of way with arrows

### Fallback Alert Generation (`buildFallbackSlackMessage()`)

If a failed trace has no pre-defined Slack card, we generate one from the trace's own data:

- **Header**: `:rotating_light: Trace failed - {trace.name}`
- **Context**: Status + posted time
- **Section**: The error span's type, name, environment, and error message
- **Fields**: Cost, model, environment, tokens
- **Actions**: "View Trace" button (links to `/traces/{id}`)

This ensures **every failed trace gets an alert**, not just the ones with pre-defined cards. The fallback card looks like a real Slack card - same block types, same formatting, same button styles.

### Incident Context Sidebar

When viewing a Slack card (in preview or full-screen), a right sidebar shows:

- Cost, Tokens, Status, Environment (small metric tiles)
- Root exception (if any error span)
- "Explore Trace Spans" button (links to `/traces/{id}`)

This sidebar is collapsible (hide/show toggle) and shows on both desktop and mobile (as a sheet on mobile). It gives context without leaving the Slack card view.

---

## Issues Board

### Three-Column Kanban (`IssueBoard.tsx`)

**Open / In Progress / Resolved.**

Three columns, 340px wide each. Why 340px? Because a typical issue card has: ID (8 chars), title (~40 chars), assignee avatar (small), priority dot. 340px gives enough room for the title without truncation, plus 16px padding. Narrower and titles truncate; wider and the screen doesn't fit 3 columns.

**HTML5 Drag-and-Drop over a library.**

Chose native HTML5 DnD over `@dnd-kit` or `react-beautiful-dnd`. The native API is ~50 lines of code and gets us drag feedback (card at 50% opacity), drop target highlighting (dashed accent border), and status change on drop. The trade-off: no drag animation/ghost.

**Drop target feedback: dashed accent border + p-3 padding.**

When you drag a card over a column, the column gets a `dashed-2` border in the accent color, with `p-3` padding inside. The dash pattern (2px dash, 2px gap) is subtle but visible. The padding creates space so the drop target doesn't feel cramped.

### Status Change via Select AND Drag

We offer both: drag to move between columns, AND a shadcn Select dropdown on the card (both in the board view and the detail view). Why both? Because some users are mouse-driven (drag), some are keyboard-driven (select). Drag is faster for mouse; Select is faster for keyboard. Both update the same state, so they're always in sync.

### Issue Detail View (`/issues/[id]`)

A dedicated page, not a modal. Why? Because issues have URLs. You should be able to share `https://neosigma.app/issues/ISS-001` with a coworker. A modal would need to handle URL state, history, back button. A dedicated page is simpler, shareable, and works with browser back/forward natively.

**LocalStorage for issue state.**

Issues are created client-side (no backend). We store them in `localStorage` under `sigma_issues`. Why localStorage and not in-memory? Because if the user creates an issue, navigates away, and comes back, the issue should still exist. Without localStorage, a page refresh would wipe all created issues. A counter key (`sigma_issues_next`) ensures monotonic IDs across sessions. Seed data is pre-populated for the demo.

**`IssueDetailLoader` - The SPA Navigation Fix.**

When you create an issue via the Slack card, the toast auto-redirects to `/issues/[id]`. But `/issues/[id]` is a server page. On page reload, the server gets the ID and loads the issue. BUT on SPA navigation (clicking a link), Next.js does client-side transition without a page reload. We built `IssueDetailLoader` as a thin client component that reads the URL, looks up the issue in localStorage, and renders it. Without this, client-created issues would 404 on SPA navigation.

---

## Key Routing Decisions

| Route                | Behavior                              |
| -------------------- | ------------------------------------- |
| `/dashboard`         | Full-screen dashboard. No side panel. |
| `/traces`            | List only. No selection.              |
| `/traces?id=xxx`     | List + preview panel. Desktop only.   |
| `/traces/xxx`        | Full-screen trace detail.             |
| `/slack`             | Incident list + tutorial.             |
| `/slack?traceId=xxx` | Incident context + Slack card.        |
| `/slack/xxx`         | Full-screen Slack card.               |
| `/issues`            | Kanban board.                         |
| `/issues/xxx`        | Issue detail.                         |

**Preview vs Full-Screen:**

- `?id=` = preview (side panel visible, dual-panel on desktop)
- `/[id]` = full-screen (no side panel, dedicated view)
- Mobile (<1024px) always navigates to `/[id]` because there's no room for dual-panel

---

## More Details

1. **Toast auto-redirect**: After creating an issue, toast appears with "View" button. Auto-redirects in 3 seconds. User can click "View" to go immediately or wait.
2. **Empty states**: Every list, chart, and table has a designed empty state (not just "No data"). Specific messages like "No traces match your filters" with a "Clear filters" button.

---

## What Was Cut

- **Model breakdown table pagination**: We show all models in a scrollable table. With only ~7 models, pagination is not really neccessary.
- **Advanced search (regex, fields)**: Search is simple substring matching. Advanced search would be useful.
- **Trace comparison**: Side-by-side trace comparison would be powerful but complex.
- **Keyboard shortcuts**: Linear-style shortcuts (j/k for navigation, / for search)
- **Notification Bar**: Earlier was thinking of adding a notifcation card in sidebar and also like a sub-sidebar specifically or notifcation, in collapsed sidebar, notifcation visible when hovered by floating card. Like around this
