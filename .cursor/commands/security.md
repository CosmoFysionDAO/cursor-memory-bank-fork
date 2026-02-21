# SECURITY Command - Check Security Agent Mode

This command is a **utility** (not part of the main workflow `/van` → `/plan` → `/creative` → `/build` → `/reflect` → `/archive`). It checks and updates agent security configuration and rules: AGENT.md/AGENTS.md, `.cursorignore`, and security-oriented rules in `.cursor/rules/`. Use **deep research** (official Cursor docs and best practices) to keep recommendations current.

## Purpose

**Check Security Agent Mode:** Verify and update:
- `.cursorignore` — so sensitive files (env, credentials, keys) are excluded from agent access and indexing
- AGENT.md or AGENTS.md — project-level agent instructions, including security and constraints
- `.cursor/rules/` — security-focused rules (e.g. do not read/change ignored files, do not embed secrets)

Prefer official sources: docs.cursor.com, cursor.com/docs, and widely accepted patterns for secrets (.env, credentials, keys).

## Optional: Memory Bank

If the project has a `memory-bank/` directory, you may append to `memory-bank/progress.md` a short note that a security check was run and which files were created or updated.

## Workflow

### Step 1: Deep research

- Use web search and documentation to gather current information on:
  - Cursor Agent Security (what the agent can access, how it is restricted)
  - Cursor ignore files (`.cursorignore`): syntax (same as `.gitignore`), what is excluded (indexing, agent access), default or recommended patterns
  - AGENTS.md / AGENT.md: role in Cursor rules hierarchy, typical structure (role, context, constraints, security)
  - Best practices for excluding secrets and sensitive paths (e.g. `.env*`, credentials, keys, `**/private/**`, `**/secrets/**`)
- Summarize findings in a short report (in your reply or, if present, in `memory-bank/`). This report drives the following steps.

### Step 2: .cursorignore

- Read the project root `.cursorignore` if it exists.
- Use `.cursor/templates/cursorignore_security_defaults.md` as the base for recommended patterns (do not copy comment lines into `.cursorignore`; only valid gitignore-style patterns).
- Add or update patterns so that at least the following are covered:
  - `.env`, `.env.*`, `.env.local`, and similar
  - `*credentials*`, `*secrets*` (e.g. `**/credentials.json`, `**/secrets.json`, `**/secrets.yml`)
  - `*.key`, `*.pem`, `**/id_rsa`, `**/id_ed25519`
  - `**/private/**`, `**/secrets/**`
- Add any project-specific sensitive paths you identify.
- If `.cursorignore` does not exist, create it at the project root with these patterns.
- Output the final or proposed contents; apply changes if the user expects automatic updates.

### Step 3: AGENT.md / AGENTS.md

- Check for `AGENT.md` or `AGENTS.md` in the project root (or a path specified by the project).
- If the file is missing:
  - Create it with: project/agent description, role and responsibilities, context (stack, structure), constraints, and a **security section** based on `.cursor/templates/agent_security_snippet.md`.
- If the file exists:
  - Propose or add a **security section** (from `.cursor/templates/agent_security_snippet.md`) or update the existing one using research and the snippet. Ensure it references `.cursorignore`, no secrets in code, and following `.cursor/rules/` and the `/security` command for future checks.

### Step 4: Security rules in .cursor/rules/

- Based on research and project layout, create or update **only security-related** rules:
  - **Option A:** Add a new file under `.cursor/rules/` (e.g. `security.mdc` or `agent-security.mdc`) with rules such as:
    - Do not read or modify files that are excluded by `.cursorignore`.
    - Do not insert real secrets, API keys, or passwords into code; use env vars or placeholders.
    - Follow security-related constraints from AGENT.md/AGENTS.md.
  - **Option B:** If the project prefers a single rules file, add a short security subsection to the existing root rule (e.g. in `.cursor/rules/` or the main rule file) with the same ideas.
- Prefer Option A if the project already uses multiple `.mdc` files under `.cursor/rules/`.

### Step 5: Report

- Provide a short summary:
  - What was **changed** (e.g. `.cursorignore` created/updated, AGENT.md section added, new `security.mdc`).
  - What was **suggested** but not applied (if anything was only proposed for manual review).

## Usage

Type `/security` to run the Check Security Agent Mode. No arguments required.

## Next steps

After running `/security`, review the report and apply any suggested changes. Re-run `/security` when the project structure or sensitive paths change, or when Cursor documentation is updated.
