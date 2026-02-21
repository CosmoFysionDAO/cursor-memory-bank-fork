# CREATIVE Command - Design Decisions

This command performs structured design exploration for components flagged during planning. It supports **multiple modes** selected by the current task type in `memory-bank/tasks.md`.

## Memory Bank Integration

Reads from:
- `memory-bank/tasks.md` - Components requiring creative phases, **and current task `type:`** (see Mode Selection below)
- `memory-bank/activeContext.md` - Current project context

Creates (depending on mode):
- `memory-bank/creative/creative-[feature_name].md` - Design decision documents (default mode)
- `memory-bank/decisions/adr-{timestamp}.md` - Architecture Decision Records (ADR mode)
- `memory-bank/creative/rnd-[feature].md` - R&D comparison documents (R&D mode)

Updates:
- `memory-bank/tasks.md` - Records design decisions

## Progressive Rule Loading

### Step 1: Load Core Rules
```
Load: .cursor/rules/isolation_rules/main.mdc
Load: .cursor/rules/isolation_rules/Core/memory-bank-paths.mdc
```

### Step 2: Load CREATIVE Mode Map
```
Load: .cursor/rules/isolation_rules/visual-maps/creative-mode-map.mdc
```

### Step 3: Load Creative Phase Enforcement
```
Load: .cursor/rules/isolation_rules/Core/creative-phase-enforcement.mdc
Load: .cursor/rules/isolation_rules/Core/creative-phase-metrics.mdc
```

### Step 4: Load Specialized Creative Rules (Lazy Loaded)
Load only when specific creative phase type is needed:

**For Architecture Design:**
```
Load: .cursor/rules/isolation_rules/Phases/CreativePhase/creative-phase-architecture.mdc
```

**For UI/UX Design:**
```
Load: .cursor/rules/isolation_rules/Phases/CreativePhase/creative-phase-uiux.mdc
```

**For Algorithm Design:**
```
Load: .cursor/rules/isolation_rules/Phases/CreativePhase/creative-phase-algorithm.mdc
```

## Mode Selection (First Step)

**Before executing the main workflow**, read `memory-bank/tasks.md` and `memory-bank/activeContext.md` and determine the **current task type**:

- If the active task in `tasks.md` has **`type: architecture-decision`** (or equivalent) → run **ADR mode** (see below).
- If the active task has **`type: research-spike`** (or equivalent) → run **R&D mode** (see below).
- Otherwise → run the **standard creative workflow** (steps 1–5 below).

### ADR Mode
- Use template: `.cursor/templates/adr_template.md`.
- Create document: `memory-bank/decisions/adr-{timestamp}.md` (e.g. `adr-20250221-143022.md`).
- Fill: Context, Decision, Alternatives Considered, Consequences, References.
- Ensure directory `memory-bank/decisions/` exists; create it if needed.
- Update `memory-bank/tasks.md` with a reference to the new ADR.

### R&D Mode
- Use template: `.cursor/templates/rnd_template.md`.
- Create document: `memory-bank/creative/rnd-{feature}.md` (e.g. `rnd-auth-strategy.md`).
- Compare 2–3 approaches (Go/infrastructure); include trade-offs table and a clear recommendation.
- Update `memory-bank/tasks.md` with the R&D outcome.

## Workflow (Standard Creative)

1. **Verify Planning Complete**
   - Check `memory-bank/tasks.md` for planning completion
   - Verify creative phases are identified
   - If not complete, return to `/plan` command

2. **Identify Creative Phases**
   - Read components flagged for creative work from `memory-bank/tasks.md`
   - Prioritize components for design exploration

3. **Execute Creative Phase**
   For each component:
   - **🎨🎨🎨 ENTERING CREATIVE PHASE: [TYPE]**
   - Define requirements and constraints
   - Generate 2-4 design options
   - Analyze pros/cons of each option
   - Select and justify recommended approach
   - Document implementation guidelines
   - Verify solution meets requirements
   - **🎨🎨🎨 EXITING CREATIVE PHASE**

4. **Document Decisions**
   - Create `memory-bank/creative/creative-[feature_name].md`
   - Update `memory-bank/tasks.md` with design decisions

5. **Verify Completion**
   - Ensure all flagged components have completed creative phases
   - Mark creative phase as complete in `memory-bank/tasks.md`

## Usage

- **Standard:** Type `/creative` to start creative design work for components flagged in the plan.
- **ADR:** In `memory-bank/tasks.md` set the current task `type: architecture-decision`, then run `/creative` to generate an ADR in `memory-bank/decisions/`.
- **R&D:** In `memory-bank/tasks.md` set the current task `type: research-spike`, then run `/creative` to generate an R&D document in `memory-bank/creative/rnd-{feature}.md`.

## Next Steps

After all creative phases complete, proceed to `/build` command for implementation.

