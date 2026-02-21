# Extended Commands Integration (Fork)

This fork extends [Memory Bank v0.8](https://github.com/vanzan01/cursor-memory-bank) with the following integrations. Workflow extensions are modes or subcommands within the existing chain; **utility commands** (e.g. `/security`) are outside the main workflow.

## Summary

| Extension | Where | How to use |
|-----------|--------|------------|
| **ADR** | `/creative` mode | Set `type: architecture-decision` in active task in `memory-bank/tasks.md`, then run `/creative` |
| **R&D** | `/creative` mode | Set `type: research-spike` in active task, then run `/creative` |
| **testify** | `/build` subcommand | Run `/build testify` (generates table-driven tests for Go code) |
| **proto** | `/build` subcommand | Run `/build proto` (generates/updates .proto, Apollo Federation–aware) |
| **dockerize** | `/build` subcommand | Run `/build dockerize` (Dockerfile + docker-compose, non-root, healthchecks) |
| **debrief** | `/reflect` and `/archive` | Runs automatically at end of `/reflect` and before completion of `/archive` |
| **/agent** | Utility command | Run `/agent init`, `/agent audit`, `/agent update-rules`, `/agent check` — Security Agent Mode: AGENT.md, .agentignore, memory-bank/audit/, rules from audit |
| **/build security-check** | `/build` subcommand | Run `/agent check` before build; abort if critical issues |
| **/security** | Utility command | Run `/security` — Check Security Agent Mode: AGENT.md, .cursorignore, .cursor/rules; deep research to update security rules |

## Files Added/Modified

- **.cursor/templates/** – `adr_template.md`, `rnd_template.md`, `cursorignore_security_defaults.md`, `agent_security_snippet.md`
- **.cursor/commands/creative.md** – Mode selection (ADR / R&D / standard)
- **.cursor/commands/build.md** – Subcommands testify, proto, dockerize
- **.cursor/commands/reflect.md** – Debrief step at end
- **.cursor/commands/archive.md** – Debrief step before completion
- **.cursor/commands/agent.md** – Security Agent Mode (utility): init, audit, update-rules, check
- **.cursor/commands/agent.js** – Node script for programmatic/CI use: `node .cursor/commands/agent.js <subcommand>`
- **.cursor/commands/security.md** – Check Security Agent Mode (utility)
- **.cursor/templates/agent_template.md**, **.cursor/templates/agentignore_defaults.md** – Used by `/agent init`
- **memory-bank/audit/** – Audit reports from `/agent audit`
- **.cursor/commands/README.md** – New; full command and extension docs
- **memory-bank/decisions/** – Directory for ADR files (created when first ADR is written)
- **memory-bank/decisionLog.md** – Created/updated by debrief
- **COMMANDS_README.md**, **README.md** – Updated Command Reference and Memory Bank structure

## Debrief (synchronizeMemoryBank)

Runs automatically:

1. **At end of `/reflect`:** Update `progress.md`, adjust `activeContext.md`, append ADR refs to `decisionLog.md`.
2. **Before completing `/archive`:** Final progress summary, reset `activeContext.md`, update `decisionLog.md` with any new ADRs.

Change tracking can use `git diff` or the list of changed files available in the environment.
