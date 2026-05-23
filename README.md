# NSBC Process Builder

> **Part of the NSBC Platform** — A multi-tenant SaaS platform for accounting firms.
> This app is one of two Next.js iframe modules embedded in the Bubble.io shell.

---

## Table of Contents

1. [What This Is](#what-this-is)
2. [How It Fits Into the Platform](#how-it-fits-into-the-platform)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [How It Works — End to End](#how-it-works--end-to-end)
6. [Key Concepts](#key-concepts)
7. [State Management](#state-management)
8. [Supabase Integration](#supabase-integration)
9. [Bubble ↔ iframe Communication](#bubble--iframe-communication)
10. [Component Reference](#component-reference)
11. [What Is Built](#what-is-built)
12. [What Is Not Built Yet](#what-is-not-built-yet)
13. [Build Order for Remaining Work](#build-order-for-remaining-work)
14. [Running Locally](#running-locally)
15. [Environment Variables](#environment-variables)

---

## What This Is

The **NSBC Process Builder** is a visual workflow editor for accounting firms. It allows accountants to build reusable process templates — step-by-step workflows for services like payroll processing, tax preparation, monthly bookkeeping, and AFH resident billing.

Each template is a sequence of typed steps (Data, AI, Human, Communication, Logic, Reporting), each with a configurable **autonomy level** that controls how much the AI handles vs. how much requires human review.

Templates are saved to Supabase and can be executed against specific clients from the main Bubble dashboard.

**Example use case:**
> Brian Wanjiku (accountant) builds a "Bi-Weekly Payroll Run" template with 6 steps:
> Import Timesheets → AI Calculates Taxes → Accountant Reviews → Send Pay Stubs → File 941 → Confirm Deposits.
> He sets most steps to "Autonomous" but the review step to "Manual".
> He then runs this template for all 5 of his payroll clients each pay period.

---

## How It Fits Into the Platform

```
┌─────────────────────────────────────────────────────────────┐
│                     Bubble.io Shell                         │
│  Navigation · Dashboards · Auth UI · Notifications          │
│                                                             │
│   ┌─────────────────────┐   ┌──────────────────────────┐   │
│   │  Process Builder    │   │   Payroll Calculator     │   │
│   │  (this app)         │   │   (separate Next.js app) │   │
│   │  next.js iframe     │   │   next.js iframe          │   │
│   └─────────────────────┘   └──────────────────────────┘   │
│                    ↕ postMessage + JWT                      │
└─────────────────────────────────────────────────────────────┘
                            ↕
              ┌─────────────────────────┐
              │       Supabase          │
              │  Single source of truth │
              │  Postgres + Auth + RLS  │
              └─────────────────────────┘
```

**Critical rule:** Bubble never owns data. All reads and writes go through Supabase. This app uses the Supabase JS client directly with the JWT passed from Bubble.

**How it connects to the Payroll Calculator:**
When a "Bi-Weekly Payroll Run" template is executed, the AI step in that template launches the Payroll Calculator iframe. When the accountant approves the payroll run in the calculator, a postMessage is sent back — and the execution engine marks that step as `completed` in `step_executions`, advancing the process to the next step. The Process Builder is the orchestrator; the Payroll Calculator is one of its step executors.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + shadcn/ui |
| State | Zustand |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Flow Canvas | reactflow (wired but not yet rendered) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth — JWT passed via postMessage from Bubble |
| Deployment | Vercel (preview branches per PR) |

---

## Project Structure

```
nsbc-process-builder/
├── app/
│   ├── globals.css          # Tailwind base + shadcn CSS variables (dark theme)
│   ├── layout.tsx           # Root layout — dark background, no font loading
│   └── page.tsx             # Entry point — listens for NSBC_INIT postMessage
│
├── components/
│   └── Builder/
│       ├── BuilderShell.tsx          # Root layout: top bar + three-panel body
│       ├── StepPalette.tsx           # Left sidebar — click to add step types
│       ├── SimpleMode/
│       │   ├── StepList.tsx          # DnD canvas — sortable list of steps
│       │   ├── SortableStepCard.tsx  # Wraps StepCard with dnd-kit sortable hook
│       │   ├── StepCard.tsx          # Individual step card (inline edit on dbl-click)
│       │   └── AddStepButton.tsx     # + button between steps (popover picker)
│       └── ConfigPanel/
│           └── ConfigPanel.tsx       # Right sidebar — edits selected step
│
├── hooks/
│   ├── useTemplate.ts        # Autosave + load template from Supabase
│   └── useBuilderKeyboard.ts # Ctrl+Z undo, Ctrl+Shift+Z redo, Delete to remove
│
├── lib/
│   ├── bridge.ts             # postMessage bridge + DEV_PAYLOAD fallback
│   ├── stepConfig.ts         # Step type colors, labels, descriptions
│   ├── supabase.ts           # Supabase browser client (uses JWT from bridge)
│   └── utils.ts              # cn() Tailwind class merge utility
│
├── store/
│   └── builderStore.ts       # Zustand store — all builder state + history stack
│
├── types/
│   ├── step.ts               # Step, StepType, AutonomyLevel types
│   └── template.ts           # ProcessTemplate, BuilderMode, TemplateStatus types
│
├── .env.local                # Supabase URL + anon key (never commit)
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## How It Works — End to End

### 1. Initialization

When Bubble embeds this app in an iframe, it sends a `NSBC_INIT` postMessage as soon as the iframe loads:

```json
{
  "type": "NSBC_INIT",
  "payload": {
    "token": "supabase_jwt_...",
    "firmId": "uuid",
    "clientId": "uuid",
    "templateId": "uuid | null",
    "serviceId": "uuid",
    "userId": "uuid",
    "mode": "simple | flow"
  }
}
```

The `page.tsx` entry point listens for this message via `listenForInit()`. Once received, the payload is stored in Zustand and `BuilderShell` renders.

**Dev mode:** If no `NSBC_INIT` arrives within 500ms (i.e. running locally without Bubble), `bridge.ts` automatically fires a `DEV_PAYLOAD` with fake IDs. This lets the full UI run and be tested without Bubble being involved at all.

### 2. Template Load

If `templateId` is not null and not a dev ID, `useTemplate.ts` fetches the template from Supabase on mount:

```
Supabase → process_templates WHERE id = templateId
         → populates steps_json into Zustand store
         → builder renders with existing steps
```

If `templateId` is null, the builder starts with an empty canvas (new template flow).

### 3. Editing

The user builds their template using three panels:

- **Left panel (StepPalette):** Click any step type to append it to the canvas
- **Center panel (StepList):** The sortable canvas. Drag steps to reorder. Click to select. Double-click name/description to inline edit. Use `+` buttons between steps to insert at a specific position.
- **Right panel (ConfigPanel):** Edit the selected step's name, description, type, autonomy level, and assigned role.

### 4. Autosave

Every change (add step, reorder, rename, change autonomy) marks the store as `isDirty`. The `useTemplate` hook debounces 1500ms after the last change, then:

- If template already exists in Supabase → `UPDATE process_templates SET steps_json = [...], updated_at = now()`
- If new template (real firmId, no existing ID) → `INSERT INTO process_templates` and stores the returned ID

The top bar shows: `Saving…` → `Saved 10:32 AM`

### 5. Publish

Clicking **Publish** saves the current state and sets `status = 'active'` and `published_at = now()` in Supabase. It also sends a `NSBC_PUBLISH_COMPLETE` postMessage to Bubble so the parent can react (e.g. show a success notification, close the iframe, refresh the templates list).

### 6. Undo / Redo

Every destructive action (add, delete, reorder, update) pushes the previous `steps` array onto a history stack (max 50 entries). Undo pops from the stack. Redo moves forward.

Keyboard shortcuts:
- `Ctrl+Z` — Undo
- `Ctrl+Shift+Z` or `Ctrl+Y` — Redo
- `Delete` / `Backspace` — Delete selected step (when not focused in an input)

---

## Key Concepts

### Step Types

| Type | Color | Description |
|---|---|---|
| `data` | Blue `#3b82f6` | Import, fetch, sync data sources |
| `ai` | Purple `#a855f7` | AI categorization, OCR, analysis |
| `human` | Amber `#f59e0b` | Manual review, approval gate |
| `communication` | Green `#22c55e` | Email / SMS via Nylas / ClickSend |
| `logic` | Rose `#f43f5e` | Branching, conditions, loops |
| `reporting` | Cyan `#06b6d4` | Generate reports, trigger next process |

### Autonomy Levels

Controls how much the AI handles vs. how much requires human action:

| Level | Color | Bar % | Description |
|---|---|---|---|
| `manual` | Slate | 0% | Human does everything |
| `assisted` | Blue | 33% | AI suggests, human approves |
| `supervised` | Indigo | 66% | AI acts, human can override |
| `autonomous` | Emerald | 100% | AI end-to-end, exceptions only |

### Builder Modes

- **Simple Mode** — Linear list of steps. Drag to reorder. This is the primary mode and is fully built.
- **Flow Mode** — Node-based canvas using React Flow. For branching/conditional workflows. UI placeholder exists; canvas not yet implemented.

### Execution Context

When a template is *run* against a client, the builder is not involved — the execution engine (Supabase Edge Function, Phase 6) takes over. It creates a `process_executions` row and iterates through `step_executions`, calling the appropriate agent or tool per step type. The builder's job is only template authoring.

---

## State Management

All state lives in `store/builderStore.ts` (Zustand). No server state library (React Query etc.) — Supabase calls are made directly in hooks.

### Store Shape

```typescript
{
  // Auth context (from Bubble postMessage)
  initPayload: NSBCInitPayload | null

  // Template metadata
  templateId: string | null
  templateName: string
  templateDescription: string
  templateMode: 'simple' | 'flow'
  templateStatus: 'draft' | 'active' | 'archived'
  defaultAutonomy: AutonomyLevel

  // Steps (Simple Mode)
  steps: Step[]

  // Selection
  selectedStepId: string | null

  // Save state
  isDirty: boolean
  isSaving: boolean
  lastSavedAt: Date | null

  // History for undo/redo
  history: Step[][]      // stack of step snapshots
  historyIndex: number   // current position in stack
}
```

Every mutation that changes steps automatically pushes to the history stack before applying the change.

---

## Supabase Integration

### Table Used

**`process_templates`**

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Auto-generated on insert |
| `firm_id` | uuid | FK → accounting_firms. null = system library template |
| `service_id` | uuid | FK → services |
| `name` | text | Template display name |
| `description` | text | |
| `mode` | builder_mode | 'simple' \| 'flow' |
| `status` | template_status | 'draft' \| 'active' \| 'archived' |
| `steps_json` | jsonb | Array of Step objects |
| `graph_json` | jsonb | For Flow Mode — nodes + edges |
| `default_autonomy` | autonomy_level | |
| `version` | integer | Auto-incremented on publish |
| `published_at` | timestamptz | Set on Publish |
| `created_by` | uuid | FK → profiles |

### Step JSON Shape (stored in `steps_json`)

```json
[
  {
    "id": "nanoid-string",
    "type": "data",
    "name": "Import Timesheets",
    "description": "Pull employee hours from integrated system",
    "autonomy_level": "autonomous",
    "assigned_role": "ai_agent",
    "config": {}
  }
]
```

### RLS Policy

Users can only read/write templates belonging to their firm (`firm_id`). System library templates (`firm_id IS NULL`) are readable by all authenticated users. NSBC admins have full access.

---

## Bubble ↔ iframe Communication

All communication uses `window.postMessage`. The bridge is defined in `lib/bridge.ts`.

### Messages Received (Bubble → iframe)

| Type | Payload | When |
|---|---|---|
| `NSBC_INIT` | `{ token, firmId, clientId, templateId, serviceId, userId, mode }` | Immediately when iframe loads |
| `NSBC_SAVE_REQUEST` | — | When user clicks Save in Bubble UI |

### Messages Sent (iframe → Bubble)

| Type | Payload | When |
|---|---|---|
| `NSBC_SAVE_COMPLETE` | `{ templateId }` | After successful save |
| `NSBC_PUBLISH_COMPLETE` | `{ templateId }` | After publish |
| `NSBC_ERROR` | `{ message }` | On any unrecoverable error |

---

## Component Reference

### `BuilderShell`
Root component. Renders the three-panel layout: StepPalette | StepList | ConfigPanel. Hosts the top bar with template name (inline edit), mode toggle, undo/redo buttons, save status, Save Draft, and Publish.

### `StepPalette`
Left sidebar. Clicking any step type calls `addStep()` in the store, which appends the step to the end of the list and pushes to history.

### `StepList`
Center canvas. Wraps steps in a `DndContext` + `SortableContext` from dnd-kit. On `dragEnd`, calls `setSteps(arrayMove(...))`. Renders `AddStepButton` between every step and at the top/bottom.

### `SortableStepCard`
Wraps `StepCard` with `useSortable` hook. Provides the drag handle (grip icon, visible on hover). Applies CSS transform during drag. Sets `opacity: 0.4` on the dragged item.

### `StepCard`
Renders a single step. Double-click on name → inline `<input>` replaces the text, commits on Enter/blur, cancels on Escape. Same for description. Clicking the card selects it (highlights border, opens ConfigPanel).

### `AddStepButton`
Small `+` circle between steps. On click, shows a popover with all 6 step types. Selecting one calls `addStep(step, insertAt)` which splices into the correct position.

### `ConfigPanel`
Right sidebar. Shows fields for the currently selected step: Name, Description, Type (Select), Autonomy Level (radio-style buttons), Assigned To (Select). All changes call `updateStep(id, patch)` which debounces into autosave.

### `useTemplate`
Hook that wires autosave and template loading. Debounces 1500ms after `isDirty` becomes true, then saves to Supabase. On mount, loads existing template if `templateId` is a real UUID.

### `useBuilderKeyboard`
Hook attached at `BuilderShell` level. Listens for `keydown` on `window`. Ignores events when an `INPUT` or `TEXTAREA` is focused.

---

## What Is Built

- [x] Full dark theme UI — top bar, three-panel layout
- [x] Template name inline editing
- [x] Simple/Flow mode toggle (Simple fully functional)
- [x] Step palette — click to add any of 6 step types
- [x] Step cards with type color coding and autonomy bar
- [x] Inline double-click editing of step name and description
- [x] Assigned role chip on each card
- [x] Right config panel — all step fields editable
- [x] Drag-to-reorder with dnd-kit (grip handle on hover)
- [x] Insert step at any position via `+` buttons
- [x] Delete step via card X button or keyboard Delete
- [x] Undo / Redo (50-step history stack)
- [x] Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z, Delete)
- [x] Autosave with debounce (1500ms)
- [x] Save draft + Publish buttons
- [x] postMessage bridge with dev fallback
- [x] Supabase client wired
- [x] Template save (INSERT + UPDATE) logic in useTemplate
- [x] Template load logic in useTemplate

---

## What Is Not Built Yet

- [ ] **Flow Mode canvas** — React Flow node/edge graph for branching workflows. Placeholder screen exists. Need: FlowCanvas.tsx, StepNode.tsx, ConditionEdge.tsx
- [ ] **Template load from real Supabase** — logic exists in useTemplate but untested end-to-end without a real JWT from Bubble
- [ ] **Publish version increment** — needs a Supabase RPC function `increment_version` or client-side fetch of current version + 1
- [ ] **Step config extensions** — `config` jsonb on each step is empty. Needs per-type config fields (e.g. Data step: select data source; AI step: select Relevance AI agent; Communication step: select template)
- [ ] **Template validation** — lib/validator.ts exists as stub. Needs: must have at least one step, no orphaned nodes in Flow Mode
- [ ] **Execution trigger** — from Bubble, accountant selects a template + client and starts a run. Creates a `process_executions` row. Needs execution runner (Supabase Edge Function)
- [ ] **Step execution UI** — running a template shows each step's live status as it progresses through `pending → in_progress → completed`
- [ ] **Library templates** — system-wide templates (`firm_id IS NULL`) that accountants can browse and clone into their firm
- [ ] **Template duplication** — clone an existing template as a new draft
- [ ] **Bubble iframe embed** — the URL needs to be deployed to Vercel and embedded in Bubble with the correct postMessage wiring

---

## Build Order for Remaining Work

```
1. Deploy to Vercel
   → Get a live URL for Bubble to embed

2. Wire Bubble postMessage
   → On Services page, when accountant clicks "New Template" or "Edit"
   → Bubble sends NSBC_INIT with real JWT + serviceId + templateId
   → Test that template saves/loads correctly end to end

3. Flow Mode Canvas
   → FlowCanvas.tsx using reactflow
   → StepNode.tsx custom node
   → ConditionEdge.tsx for branching
   → serializer.ts converts steps_json ↔ reactflow nodes/edges

4. Step config extensions
   → Per-type config fields in ConfigPanel
   → Store in step.config jsonb

5. Template validation
   → lib/validator.ts
   → Warn before publish if invalid

6. Execution engine (Phase 6 in architecture)
   → Supabase Edge Function: process_execution_runner
   → Creates process_executions + step_executions rows
   → Step status transitions
   → When step type is 'ai' and agent is payroll: launches Payroll Calculator iframe,
     passes executionId + stepExecutionId in postMessage payload

7. Library templates
   → Browse/search system templates
   → Clone into firm
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server (auto-uses DEV_PAYLOAD after 500ms)
npm run dev

# Open in browser
open http://localhost:3000
```

No Bubble connection needed for local development. The bridge automatically seeds fake auth data.

---

## Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Both values are found in your Supabase project under **Settings → API**.

> ⚠️ Never commit `.env.local`. It is already in `.gitignore`.

---

*NSBC Platform — Process Builder · Internal Documentation*
*Next.js 14 · Supabase · Bubble.io*