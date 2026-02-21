# Memory Bank Commands

This directory contains Cursor 2.0 commands that replace the deprecated custom modes feature. Each command implements a specific phase of the Memory Bank workflow with progressive rule loading to optimize context usage.

## Available Commands

### `/van` - Initialization & Entry Point
**Purpose:** Initialize Memory Bank, detect platform, determine task complexity, and route to appropriate workflows.

**When to use:** 
- Starting a new task or project
- Initializing Memory Bank structure
- Determining task complexity

**Next steps:**
- Level 1 tasks → `/build`
- Level 2-4 tasks → `/plan`

### `/plan` - Task Planning
**Purpose:** Create detailed implementation plans based on complexity level.

**When to use:**
- After `/van` determines Level 2-4 complexity
- Need to create structured implementation plan

**Next steps:**
- Creative phases identified → `/creative`
- No creative phases → `/build`

### `/creative` - Design Decisions (Extended)
**Purpose:** Perform structured design exploration. **Mode is selected by the current task `type` in `memory-bank/tasks.md`:**
- **`type: architecture-decision`** → ADR mode: creates `memory-bank/decisions/adr-{timestamp}.md` (template: `.cursor/templates/adr_template.md`)
- **`type: research-spike`** → R&D mode: creates `memory-bank/creative/rnd-{feature}.md` (template: `.cursor/templates/rnd_template.md`)
- **Default** → Standard creative workflow; creates `memory-bank/creative/creative-[feature_name].md`

**When to use:**
- After `/plan` identifies components needing design decisions
- Need an Architecture Decision Record (ADR)
- Need an R&D comparison (2–3 approaches, trade-offs, recommendation)

**Next steps:**
- After all creative phases complete → `/build`

### `/build` - Code Implementation (with Subcommands)
**Purpose:** Implement planned changes, or run a subcommand to generate a specific artifact.

**Subcommands:**
- **`/build testify`** – Generate table-driven tests (TDT) for selected/current Go code; update `memory-bank/progress.md`
- **`/build proto`** – Generate or update `.proto` files (Apollo Federation–aware); update `memory-bank/progress.md`
- **`/build dockerize`** – Generate multi-stage Dockerfile and docker-compose.yml (non-root, healthchecks); update `memory-bank/progress.md`

**When to use:**
- After planning is complete (and creative phases if needed) → use `/build` for full implementation
- Need tests for Go code → `/build testify`
- Need proto definitions → `/build proto`
- Need container setup → `/build dockerize`

**Next steps:**
- After implementation or subcommand complete → `/reflect`

### `/reflect` - Task Reflection
**Purpose:** Facilitate structured reflection on completed implementation. **At the end, runs Memory Bank Synchronization (Debrief)** automatically: updates `progress.md`, adjusts `activeContext.md`, appends ADR references to `decisionLog.md`.

**When to use:**
- After `/build` completes implementation
- Need to document lessons learned and process improvements

**Next steps:**
- After reflection complete → `/archive`

### `/archive` - Task Archiving
**Purpose:** Create comprehensive archive documentation and update Memory Bank. **Before completing, runs Debrief:** final progress summary, reset `activeContext.md`, update `decisionLog.md` with ADR references.

**When to use:**
- After `/reflect` completes reflection
- Ready to finalize task documentation

**Next steps:**
- After archiving complete → `/van` (for next task)

## Command Workflow

```
/van → /plan → /creative → /build → /reflect → /archive
  ↓       ↓        ↓         ↓         ↓          ↓
Level 1  Level   Level    Level    Level     Level
tasks    2-4     3-4      1-4      1-4       1-4
```

## Progressive Rule Loading

Each command implements progressive rule loading to optimize context usage:

1. **Core Rules** - Always loaded (main.mdc, memory-bank-paths.mdc)
2. **Mode-Specific Rules** - Loaded based on command (mode maps)
3. **Complexity-Specific Rules** - Loaded based on task complexity level
4. **Specialized Rules** - Lazy loaded only when needed (e.g., creative phase types)

This approach reduces initial token usage by ~70% compared to loading all rules at once.

## Memory Bank Integration

All commands read from and update files in the `memory-bank/` directory:

- **tasks.md** - Source of truth for task tracking
- **activeContext.md** - Current project focus
- **progress.md** - Implementation status
- **projectbrief.md** - Project foundation
- **creative/** - Creative phase documents, R&D documents (`rnd-*.md`)
- **decisions/** - Architecture Decision Records (`adr-{timestamp}.md`)
- **reflection/** - Reflection documents
- **archive/** - Archive documents
- **decisionLog.md** - Log of ADR references (updated by debrief in `/reflect` and `/archive`)

## Usage Examples

### Starting a New Task
```
/van Initialize project for adding user authentication feature
```

### Planning a Feature
```
/plan
```

### Exploring Design Options
```
/creative
```

### ADR and R&D (Creative modes)
In `memory-bank/tasks.md` set the active task to `type: architecture-decision` or `type: research-spike`, then:
```
/creative
```

### Implementing Changes
```
/build
```

### Build Subcommands (testify, proto, dockerize)
```
/build testify
/build proto
/build dockerize
```
Each updates `memory-bank/progress.md` with the generated artifact.

### Reflecting on Completion
```
/reflect
```

### Archiving Completed Task
```
/archive
```

## Migration from Custom Modes

These commands replace the previous custom modes:
- **VAN Mode** → `/van` command
- **PLAN Mode** → `/plan` command
- **CREATIVE Mode** → `/creative` command
- **BUILD Mode** → `/build` command
- **REFLECT Mode** → `/reflect` command
- **ARCHIVE Mode** → `/archive` command

The functionality remains the same, but now uses Cursor 2.0's commands feature instead of custom modes.

