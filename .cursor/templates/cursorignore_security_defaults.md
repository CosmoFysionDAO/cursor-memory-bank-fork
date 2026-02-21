# Recommended .cursorignore patterns (security defaults)

Use this list as the base when creating or updating `.cursorignore`. Syntax is the same as `.gitignore`. One pattern per line; lines starting with `#` are comments and should not be copied into `.cursorignore` verbatim—use them only as documentation.

## Environment and secrets
.env
.env.*
.env.local
.env.development
.env.production
.env.test
*.env

## Credentials and keys
**/credentials.json
**/secrets.json
**/secrets.yml
**/secrets.yaml
**/*.key
**/*.pem
**/id_rsa
**/id_ed25519
**/*.p12
**/*.pfx

## Private and sensitive directories
**/private/**
**/secrets/**
**/config/secrets*

## Optional (uncomment or add if project uses them)
# **/node_modules/
# **/.venv/
# **/vendor/
# **/dist/
# **/build/
