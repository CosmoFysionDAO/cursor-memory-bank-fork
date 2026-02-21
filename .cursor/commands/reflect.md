# REFLECT Command - Task Reflection

This command facilitates structured reflection on completed implementation, documenting lessons learned and process improvements.

## Memory Bank Integration

Reads from:
- `memory-bank/tasks.md` - Completed implementation details
- `memory-bank/progress.md` - Implementation status and observations
- `memory-bank/creative/creative-*.md` - Design decisions (Level 3-4)

Creates:
- `memory-bank/reflection/reflection-[task_id].md` - Reflection document

Updates:
- `memory-bank/tasks.md` - Reflection status
- `memory-bank/progress.md` - Debrief: work completed this phase
- `memory-bank/activeContext.md` - Adjust context for next step
- `memory-bank/decisionLog.md` - Append ADR references from `memory-bank/decisions/` (create if missing)

## Progressive Rule Loading

### Step 1: Load Core Rules
```
Load: .cursor/rules/isolation_rules/main.mdc
Load: .cursor/rules/isolation_rules/Core/memory-bank-paths.mdc
```

### Step 2: Load REFLECT Mode Map
```
Load: .cursor/rules/isolation_rules/visual-maps/reflect-mode-map.mdc
```

### Step 3: Load Complexity-Specific Reflection Rules
Based on complexity level from `memory-bank/tasks.md`:

**Level 1:**
```
Load: .cursor/rules/isolation_rules/Level1/quick-documentation.mdc
```

**Level 2:**
```
Load: .cursor/rules/isolation_rules/Level2/reflection-basic.mdc
```

**Level 3:**
```
Load: .cursor/rules/isolation_rules/Level3/reflection-intermediate.mdc
```

**Level 4:**
```
Load: .cursor/rules/isolation_rules/Level4/reflection-comprehensive.mdc
```

## Workflow

1. **Verify Implementation Complete**
   - Check `memory-bank/tasks.md` for implementation completion
   - If not complete, return to `/build` command

2. **Review Implementation**
   - Compare implementation against original plan
   - Review creative phase decisions (Level 3-4)
   - Review code changes and testing

3. **Document Reflection**

   **Level 1:**
   - Quick review of bug fix
   - Document solution

   **Level 2:**
   - Review enhancement
   - Document what went well
   - Document challenges
   - Document lessons learned

   **Level 3-4:**
   - Comprehensive review of implementation
   - Compare against original plan
   - Document what went well
   - Document challenges encountered
   - Document lessons learned
   - Document process improvements
   - Document technical improvements

4. **Create Reflection Document**
   - Create `memory-bank/reflection/reflection-[task_id].md`
   - Structure: Summary, What Went Well, Challenges, Lessons Learned, Process Improvements, Technical Improvements, Next Steps

5. **Update Memory Bank**
   - Update `memory-bank/tasks.md` with reflection status
   - Mark reflection phase as complete

6. **Memory Bank Synchronization (Debrief)** — run automatically at the end of `/reflect`
   - **synchronizeMemoryBank():**
     - Analyze project changes since the last commit (or since task start); use `git diff` or the list of changed files if available from the environment.
     - Update `memory-bank/progress.md`: add a short description of work completed in this phase.
     - Update `memory-bank/activeContext.md`: adjust or narrow context for the next step (do not fully reset yet; that happens in `/archive`).
     - If any ADRs were created in `memory-bank/decisions/` during this task, append a brief entry to `memory-bank/decisionLog.md` (date, ADR file name, one-line summary). Create `memory-bank/decisionLog.md` if it does not exist.

## Usage

Type `/reflect` to start reflection on the completed task.

## Next Steps

After reflection complete, proceed to `/archive` command to finalize task documentation.

