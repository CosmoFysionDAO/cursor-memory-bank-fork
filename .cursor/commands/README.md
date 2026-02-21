# Memory Bank Commands

This directory contains Cursor 2.0 commands for the Memory Bank workflow. Each command implements a specific phase with progressive rule loading. **Extended capabilities** (ADR, R&D, testify, proto, dockerize, debrief) are integrated as modes or subcommands within the existing workflow.

## Available Commands

### `/van` - Initialization & Entry Point
**Purpose:** Initialize Memory Bank, detect platform, determine task complexity, and route to appropriate workflows.

**Next steps:** Level 1 → `/build`; Level 2-4 → `/plan`

### `/plan` - Task Planning
**Purpose:** Create detailed implementation plans based on complexity level.

**Next steps:** Creative phases identified → `/creative`; otherwise → `/build`

### `/creative` - Design Decisions (Extended)
**Purpose:** Structured design exploration. Supports **three modes** based on the current task `type` in `memory-bank/tasks.md`:

| Task type in tasks.md        | Mode   | Output |
|-----------------------------|--------|--------|
| `type: architecture-decision` | **ADR** | `memory-bank/decisions/adr-{timestamp}.md` |
| `type: research-spike`      | **R&D** | `memory-bank/creative/rnd-{feature}.md` |
| (default)                   | **Standard** | `memory-bank/creative/creative-[feature_name].md` |

**Templates:** `.cursor/templates/adr_template.md`, `.cursor/templates/rnd_template.md`

**Examples:**
```
/creative
```
(With `type: architecture-decision` in the active task → generates ADR in `memory-bank/decisions/`.)

(With `type: research-spike` → generates R&D comparison in `memory-bank/creative/rnd-*.md`.)

**Next steps:** After all creative phases → `/build`

### `/build` - Code Implementation (with Subcommands)
**Purpose:** Implement planned changes, or run a **subcommand** to generate a specific artifact.

**Subcommands:**

| Invocation        | Action |
|-------------------|--------|
| `/build`           | Full implementation workflow (default) |
| `/build testify`  | Generate table-driven tests (TDT) for selected/current Go code; update `memory-bank/progress.md` |
| `/build proto`    | Generate/update `.proto` files (Apollo Federation–aware); update `memory-bank/progress.md` |
| `/build dockerize`| Generate multi-stage Dockerfile and docker-compose.yml (non-root, healthchecks); update `memory-bank/progress.md` |

**Examples:**
```
/build
/build testify
/build proto
/build dockerize
```

**Next steps:** After implementation or subcommand → `/reflect`

### `/reflect` - Task Reflection
**Purpose:** Structured reflection on completed implementation. **At the end**, runs **Memory Bank Synchronization (Debrief)** automatically:
- Update `memory-bank/progress.md` with work completed
- Adjust `memory-bank/activeContext.md` for the next step
- Append ADR references to `memory-bank/decisionLog.md` (create if missing)

**Next steps:** → `/archive`

### `/archive` - Task Archiving
**Purpose:** Create archive documentation and update Memory Bank. **Before completing**, runs **Debrief**:
- Final update to `memory-bank/progress.md`
- Reset `memory-bank/activeContext.md` for the next task
- Update `memory-bank/decisionLog.md` with any new ADRs

**Next steps:** → `/van` (next task)

## Command Workflow

```
/van → /plan → /creative → /build → /reflect → /archive
  ↓       ↓        ↓         ↓         ↓          ↓
Level 1  Level   Level    Level    Level     Level
tasks    2-4     3-4      1-4      1-4       1-4
```

## Extended Features Summary

- **ADR:** Set `type: architecture-decision` for the active task in `tasks.md`, then run `/creative` → ADR in `memory-bank/decisions/`.
- **R&D:** Set `type: research-spike`, then `/creative` → R&D doc in `memory-bank/creative/rnd-{feature}.md`.
- **testify / proto / dockerize:** Use `/build testify`, `/build proto`, `/build dockerize`; each updates `memory-bank/progress.md`.
- **Debrief:** Runs automatically at the end of `/reflect` and before completion of `/archive` (progress, activeContext, decisionLog).

## Memory Bank Files

- **tasks.md** – Source of truth; may include `type:` for current task (e.g. `architecture-decision`, `research-spike`)
- **activeContext.md** – Current focus (updated by debrief)
- **progress.md** – Implementation status and subcommand/debrief summaries
- **decisionLog.md** – Log of ADR references (created/updated by debrief)
- **creative/** – Creative docs, R&D docs (`rnd-*.md`)
- **decisions/** – ADR documents (`adr-{timestamp}.md`)
- **reflection/** – Reflection documents
- **archive/** – Archive documents

## Progressive Rule Loading

Each command loads: Core rules → Mode map → Complexity-specific rules → Specialized rules (lazy). See individual command `.md` files for exact paths.
