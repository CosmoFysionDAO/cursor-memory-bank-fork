# BUILD Command - Code Implementation

This command implements the planned changes following the implementation plan and creative phase decisions. It enforces a test-driven approach where tests are written for all success criteria and must pass before completing each phase.

**Subcommands:** If the user invoked `/build` with a subcommand (e.g. `/build testify`, `/build proto`, `/build dockerize`, `/build security-check`), execute **only** that subcommand (see "Build Subcommands" below), then update `memory-bank/progress.md` with what was generated where applicable. Otherwise run the full build workflow.

## Build Subcommands

### `/build security-check`
- **Action:** Before proceeding with the build, run a quick security check (equivalent to `/agent check`). If critical (high-severity) issues are found, **abort** the build and report them; suggest the user run `/agent audit` or fix the issues first. If no critical issues, continue with the normal build workflow.
- **Implementation:** Run `node .cursor/commands/agent.js check` (or perform the same static analysis and secret scan as in `/agent check`). Exit code 1 from the script means abort build.
- **After completion:** If check passed, append to `memory-bank/progress.md`: "Security check passed before build." If aborted, do not update progress with build steps until issues are resolved.

### `/build testify` (or `!testify`)
- **Input:** The code currently selected in the editor, or the current file (Go code).
- **Action:** Analyze the Go code and generate **table-driven tests (TDT)** that cover:
  - Edge cases, error conditions, and concurrency where relevant.
- **Output:** Propose the generated test code for the user to insert (or insert into the file if the user prefers).
- **After completion:** Append to `memory-bank/progress.md`: "Generated table-driven tests for [target]."

### `/build proto`
- **Input:** Domain logic from the codebase (comments, structs, or described behavior).
- **Action:** Generate or update `.proto` files with appropriate services and messages. Ensure compatibility with **Apollo Federation** (add federation options/directives as needed for the project).
- **Output:** Create or update proto files in the project’s designated proto directory.
- **After completion:** Append to `memory-bank/progress.md`: "Generated/updated .proto definitions for [domain/feature]."

### `/build dockerize`
- **Input:** Project structure and runtime requirements.
- **Action:** Generate:
  - A **multi-stage Dockerfile** (production-ready, non-root user, layer caching).
  - A **docker-compose.yml** with healthchecks and non-root execution where applicable.
- **Output:** Place `Dockerfile` and `docker-compose.yml` in the project root (or documented location).
- **After completion:** Append to `memory-bank/progress.md`: "Generated Dockerfile and docker-compose.yml."

## Memory Bank Integration

Reads from:
- `memory-bank/tasks.md` - Implementation plan and checklists
- `memory-bank/creative/creative-*.md` - Design decisions (Level 3-4)
- `memory-bank/activeContext.md` - Current project context

Updates:
- `memory-bank/tasks.md` - Implementation progress, test results, and status
- `memory-bank/progress.md` - Build status, test outcomes, observations, **and subcommand artifacts** (testify/proto/dockerize)

## Progressive Rule Loading

### Step 1: Load Core Rules
```
Load: .cursor/rules/isolation_rules/main.mdc
Load: .cursor/rules/isolation_rules/Core/memory-bank-paths.mdc
Load: .cursor/rules/isolation_rules/Core/command-execution.mdc
```

### Step 2: Load BUILD Mode Map
```
Load: .cursor/rules/isolation_rules/visual-maps/build-mode-map.mdc
```

### Step 3: Load Complexity-Specific Implementation Rules
Based on complexity level from `memory-bank/tasks.md`:

**Level 1:**
```
Load: .cursor/rules/isolation_rules/Level1/workflow-level1.mdc
Load: .cursor/rules/isolation_rules/Level1/optimized-workflow-level1.mdc
```

**Level 2:**
```
Load: .cursor/rules/isolation_rules/Level2/workflow-level2.mdc
```

**Level 3-4:**
```
Load: .cursor/rules/isolation_rules/Level3/implementation-intermediate.mdc
Load: .cursor/rules/isolation_rules/Level4/phased-implementation.mdc
```

## Workflow

1. **Verify Prerequisites**
   - Check `memory-bank/tasks.md` for planning completion
   - For Level 3-4: Verify creative phase documents exist
   - Review implementation plan

2. **Determine Complexity Level**
   - Read complexity level from `memory-bank/tasks.md`
   - Load appropriate workflow rules

3. **Execute Implementation**

   **Level 1 (Quick Bug Fix):**
   - Review bug report
   - Examine relevant code
   - Implement targeted fix
   - Write test(s) validating the fix
   - Run tests and ensure they pass
   - Update `memory-bank/tasks.md`

   **Level 2 (Simple Enhancement):**
   - Review build plan
   - Examine relevant code areas
   - Implement changes sequentially
   - Write tests for each success criterion
   - Run all tests and ensure they pass
   - Update `memory-bank/tasks.md`

   **Level 3-4 (Feature/System):**
   - Review plan and creative decisions
   - Create directory structure
   - Build in planned phases
   - **For each phase:**
     - Write tests for all phase success criteria
     - Run tests and ensure they pass
     - Do NOT proceed to next phase until all tests pass
   - Integration testing
   - Document implementation
   - Update `memory-bank/tasks.md` and `memory-bank/progress.md`

4. **Test-Driven Phase Completion**
   - Extract success criteria from current phase in `memory-bank/tasks.md`
   - Write test cases covering each success criterion
   - Execute all tests
   - **Gate:** All tests MUST pass before phase completion
   - Document test results in `memory-bank/tasks.md`
   - If tests fail: fix implementation, re-run tests, repeat until all pass

5. **Command Execution**
   - Document all commands executed
   - Document results and observations
   - Follow platform-specific command guidelines

6. **Verification**
   - Verify all build steps completed
   - Verify all success criteria tests pass
   - Verify changes meet requirements
   - Update `memory-bank/tasks.md` with completion status

## Usage

- **Full build:** Type `/build` to start implementation based on the plan in `memory-bank/tasks.md`.
- **Subcommands:** Type `/build testify`, `/build proto`, or `/build dockerize` to run only that generator; then update `memory-bank/progress.md` accordingly.

## Next Steps

After implementation complete, proceed to `/reflect` command for task review.

