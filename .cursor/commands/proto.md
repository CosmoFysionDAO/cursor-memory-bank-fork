# Proto — gRPC Definitions

Review domain logic and generate/update gRPC .proto definitions. Ensure proper documentation, naming conventions, and Apollo Federation compatibility.

- **Input:** Domain logic from the codebase (comments, structs, or described behavior).
- **Output:** Create or update `.proto` files in the project's proto directory with appropriate services and messages; add federation options/directives as needed.
- If Memory Bank exists, append to `memory-bank/progress.md`: "Generated/updated .proto definitions for [domain/feature]."
