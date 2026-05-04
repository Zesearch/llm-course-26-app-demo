# Coding Rules

## Language and Type Safety

- All TypeScript code **must** use `strict: true` in `tsconfig.json`
- All Python code **must** use type hints on all function signatures and return types
- Avoid `any` in TypeScript — use explicit types or generics
- Avoid untyped dictionaries in Python where structured models are feasible — prefer Pydantic models

## Architecture Boundaries

- **Backend owns business logic.** The frontend must never contain AI orchestration, grading logic, profile construction, or direct database queries.
- **Frontend owns presentation.** Rendering, navigation, form handling, and UI state management belong in the frontend. Backend must not dictate UI layout.
- **No architecture drift.** Do not introduce new services, storage layers, caching layers, message queues, or external dependencies without explicitly updating `ARCHITECTURE.md` and `REQUIREMENTS.md`.
- **Modular monolith.** All backend services live in the same deployable unit but must be organized into clearly separated modules (e.g., `services/document_processing/`, `services/generation/`). Do not create cross-service imports that bypass the service interface.

## Code Quality

- **No fake production logic.** If a function is a stub or mock, it must be clearly labeled with a `# STUB` or `// STUB` comment and a TODO explaining what it should do.
- **No hidden globals.** Configuration, secrets, and shared state must be passed explicitly through dependency injection or environment variables, not module-level mutable globals.
- **Modular file organization.** One responsibility per file. Do not put unrelated functions in a shared `utils.py` or `helpers.ts` — create purpose-named modules.
- **Production-minded code only.** Write code as if it will be deployed. No debug `print()` statements left in committed code. Use proper logging.
- **Explain assumptions.** If a design choice is non-obvious, add a brief comment explaining the reasoning.
- **Keep functions short.** Functions over 50 lines should be decomposed.

## Documentation Updates

When making implementation changes that affect any of the following, you **must** update the corresponding `.md` file:
- New API endpoint → update `API_CONTRACTS.md`
- Schema migration → update `DB_SCHEMA.md`
- New service or layer → update `ARCHITECTURE.md`
- Pipeline stage change → update `AI_PIPELINE.md`
- Task completion → update `TASKS.md`
- Phase milestone → update `IMPLEMENTATION_PHASES.md`

## Incremental Development Rules

- **One vertical slice at a time.** Complete a feature end-to-end (DB → backend → API → frontend) before starting the next. Do not build the entire backend before touching the frontend.
- **Keep PRs small.** Each change should be reviewable in isolation. Prefer many small, focused commits over monolithic changes.
- **Test before moving on.** Verify each deliverable works before marking it complete. For backend: manual API test or automated test. For frontend: visual verification in browser.
- **Do not skip the quality-control pipeline.** Generation must never collapse into a single LLM call. Even in early phases, structure the generation code to support multi-stage processing.

## AI Coding Session Rules

When starting a new AI-assisted coding session:

1. **Read context first.** Begin by reading `PROJECT_OVERVIEW.md`, `REQUIREMENTS.md`, and the file most relevant to the current task (e.g., `AI_PIPELINE.md` for pipeline work).
2. **Check current phase.** Read `IMPLEMENTATION_PHASES.md` to understand what phase you are in and what is in/out of scope.
3. **Check open tasks.** Read `TASKS.md` to see what is next.
4. **Do not invent features.** Stay within the documented requirements. If you think a feature would be valuable, document it as a suggestion — do not implement it silently.
5. **Do not change architecture silently.** If you need to deviate from `ARCHITECTURE.md`, flag it explicitly and get approval before proceeding.
6. **Define acceptance criteria before coding.** For each task, state what "done" looks like before writing implementation code.
7. **Update docs after significant changes.** If you add an endpoint, table, service, or pipeline stage, update the relevant `.md` file.

## Naming Conventions

| Layer | Convention | Example |
|---|---|---|
| Python modules | `snake_case` | `document_processing.py` |
| Python classes | `PascalCase` | `ProfessorProfileService` |
| Python functions | `snake_case` | `build_profile_from_evidence()` |
| TypeScript files | `PascalCase` for components, `camelCase` for utilities | `WorkspaceList.tsx`, `apiClient.ts` |
| TypeScript types/interfaces | `PascalCase` | `GenerationRequest` |
| Database tables | `snake_case`, plural | `generated_questions` |
| API routes | `kebab-case` | `/api/workspaces/{id}/generation-requests` |
| Environment variables | `UPPER_SNAKE_CASE` | `GEMINI_API_KEY` |

## Error Handling

- Backend: raise typed exceptions that map to HTTP status codes. Do not return raw 500 errors with stack traces.
- Frontend: display user-friendly error messages. Log technical details to console.
- All async operations (parsing, generation, grading) must handle failure states and update status tracking accordingly.

## Security Basics

- All API endpoints must require authentication (except health check)
- Use Supabase Auth tokens for request authentication
- Apply row-level security (RLS) in Supabase where feasible
- Never log secrets, tokens, or user-submitted content at INFO level
- Validate and sanitize all user inputs on the backend
