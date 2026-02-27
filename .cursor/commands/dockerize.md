# Dockerize — Production Docker

Generate production-ready, multi-stage Dockerfiles and docker-compose configurations. Ensure non-root execution and proper healthchecks for all services.

- **Input:** Project structure and runtime requirements.
- **Output:** Generate a multi-stage Dockerfile (layer caching, non-root user) and docker-compose.yml with healthchecks and non-root execution where applicable. Place in project root or documented location.
- If Memory Bank exists, append to `memory-bank/progress.md`: "Generated Dockerfile and docker-compose.yml."
