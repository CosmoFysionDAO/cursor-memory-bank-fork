# Testify — Table-Driven Tests

Analyze the selected code and generate comprehensive table-driven tests (TDT), covering edge cases, error conditions, and concurrency safety.

- **Input:** The code currently selected in the editor, or the current file (Go code).
- **Output:** Propose generated test code for the user to insert (or insert into the file if the user prefers).
- If Memory Bank exists, append to `memory-bank/progress.md`: "Generated table-driven tests for [target]."
