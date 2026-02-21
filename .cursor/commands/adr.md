# ADR — Architecture Decision Record

Generate an Architecture Decision Record (ADR) for the current change. Document the context, alternative solutions considered, and the final decision with its pros and cons.

- Use template: `.cursor/templates/adr_template.md`
- Output: create or update a document in `memory-bank/decisions/` (e.g. `adr-{timestamp}.md`) if Memory Bank exists; otherwise propose the ADR in chat.
- Include: Status, Context, Decision, Alternatives Considered, Consequences, References.
