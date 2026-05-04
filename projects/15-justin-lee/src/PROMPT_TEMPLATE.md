# Prompt Templates

Reusable prompts for AI-assisted coding sessions. Copy, fill in the bracketed fields, and paste.

---

## 1. General Feature Implementation

```
You are helping me build ExamProfile AI.

Before writing any code, read the following files in order:
1. AI_CONTEXT.md
2. docs/REQUIREMENTS.md
3. docs/IMPLEMENTATION_PHASES.md
4. docs/TASKS.md

CURRENT PHASE: [Phase X: Name]
CURRENT TASK: [Task ID and title from TASKS.md]

TASK DESCRIPTION:
[What you want built — be specific]

RELEVANT CONTEXT FILES:
- docs/ARCHITECTURE.md
- docs/API_CONTRACTS.md
- docs/DB_SCHEMA.md
- [any other relevant file]

RELEVANT SOURCE FILES:
- [list specific files to read or modify]

ACCEPTANCE CRITERIA:
- [criterion 1]
- [criterion 2]
- [criterion 3]

CONSTRAINTS:
- Do not invent features outside the spec
- Do not change architecture without updating docs/ARCHITECTURE.md
- Do not collapse generation into a single LLM call
- Do not put business logic in the frontend
- Follow docs/CODING_RULES.md for all code style and naming
- Update docs/TASKS.md when complete
- Update docs/API_CONTRACTS.md if adding endpoints
- Update docs/DB_SCHEMA.md if adding tables

Build this as a vertical slice: database → backend service → API route → frontend component.
```

---

## 2. Backend-Only Task

```
You are helping me build the backend for ExamProfile AI.

Before writing any code, read:
1. AI_CONTEXT.md
2. docs/REQUIREMENTS.md
3. docs/ARCHITECTURE.md
4. docs/API_CONTRACTS.md
5. docs/CODING_RULES.md

CURRENT PHASE: [Phase X: Name]
CURRENT TASK: [Task ID and title]

TASK DESCRIPTION:
[What backend work you want done]

RELEVANT SOURCE FILES:
- backend/[relevant paths]

ACCEPTANCE CRITERIA:
- [criterion 1]
- [criterion 2]

CONSTRAINTS:
- Python with full type hints on all signatures
- Use Pydantic models for request/response schemas
- Backend owns all business logic — no shortcuts
- Follow the service module structure: backend/services/[service_name]/
- Handle errors with typed exceptions that map to HTTP status codes
- Do not introduce new external dependencies without flagging
- Update docs/API_CONTRACTS.md if adding or changing endpoints

Do not modify frontend code. Do not invent features outside the spec.
```

---

## 3. Frontend-Only Task

```
You are helping me build the frontend for ExamProfile AI.

Before writing any code, read:
1. AI_CONTEXT.md
2. docs/REQUIREMENTS.md
3. docs/API_CONTRACTS.md
4. docs/CODING_RULES.md

CURRENT PHASE: [Phase X: Name]
CURRENT TASK: [Task ID and title]

TASK DESCRIPTION:
[What frontend work you want done]

RELEVANT SOURCE FILES:
- frontend/src/[relevant paths]

ACCEPTANCE CRITERIA:
- [criterion 1]
- [criterion 2]

CONSTRAINTS:
- React + TypeScript strict mode
- Tailwind CSS + Shadcn/ui for styling and components
- Frontend is presentation and workflow control only — no business logic
- All data comes from the backend API — no direct DB or LLM calls
- Use the API client module for all backend communication
- Display user-friendly error messages for API failures
- All interactive elements must have unique, descriptive IDs

Do not modify backend code. Do not invent features outside the spec.
```

---

## 4. Schema / Migration Task

```
You are helping me update the database schema for ExamProfile AI.

Before writing any code, read:
1. AI_CONTEXT.md
2. docs/DB_SCHEMA.md
3. docs/REQUIREMENTS.md
4. docs/ARCHITECTURE.md

CURRENT PHASE: [Phase X: Name]
CURRENT TASK: [Task ID and title]

TASK DESCRIPTION:
[What schema changes you need]

TABLES AFFECTED:
- [table name(s)]

ACCEPTANCE CRITERIA:
- [criterion 1]
- [criterion 2]

CONSTRAINTS:
- All structured data goes in PostgreSQL (Supabase)
- Vector embeddings go in ChromaDB / pgvector — not in relational tables
- Uploaded files and generated artifacts go in file/object storage — not in DB
- Use UUID primary keys
- Use JSONB for serialized flexible fields
- Follow the naming conventions: snake_case, plural table names
- Update docs/DB_SCHEMA.md after completing the migration
- Do not remove or rename existing columns without flagging

Provide the SQL migration and the corresponding Pydantic model.
```

---

## 5. Bugfix

```
You are helping me fix a bug in ExamProfile AI.

Before making changes, read:
1. AI_CONTEXT.md
2. docs/REQUIREMENTS.md
3. docs/CODING_RULES.md

BUG DESCRIPTION:
[What is broken — be specific about observed vs. expected behavior]

STEPS TO REPRODUCE:
1. [step 1]
2. [step 2]
3. [step 3]

EXPECTED BEHAVIOR:
[What should happen]

ACTUAL BEHAVIOR:
[What actually happens]

RELEVANT SOURCE FILES:
- [file paths]

CONSTRAINTS:
- Fix the root cause, not just the symptom
- Do not change architecture to fix a bug
- Do not introduce new dependencies
- Do not change unrelated code
- Explain what caused the bug and why your fix resolves it
- If the bug reveals a missing test case, note what test should be added
```

---

## 6. Refactor

```
You are helping me refactor code in ExamProfile AI.

Before making changes, read:
1. AI_CONTEXT.md
2. docs/REQUIREMENTS.md
3. docs/ARCHITECTURE.md
4. docs/CODING_RULES.md

REFACTOR DESCRIPTION:
[What you want refactored and why]

RELEVANT SOURCE FILES:
- [file paths]

GOALS:
- [goal 1 — e.g., "extract shared logic into a utility module"]
- [goal 2 — e.g., "reduce function length below 50 lines"]

CONSTRAINTS:
- Do not change external behavior — refactoring must be behavior-preserving
- Do not change API contracts
- Do not change database schema
- Do not introduce new architecture patterns without updating docs/ARCHITECTURE.md
- Follow existing naming conventions from docs/CODING_RULES.md
- Keep changes minimal and focused
- If the refactor affects service boundaries, flag it before proceeding
```

---

## 7. Vertical Slice Implementation

```
You are helping build ExamProfile AI.

Before writing any code, read:
1. AI_CONTEXT.md
2. docs/REQUIREMENTS.md
3. docs/IMPLEMENTATION_PHASES.md
4. docs/TASKS.md

CURRENT PHASE: [Phase X: Name]
CURRENT TASK: [Task ID and title]

FEATURE TO BUILD:
[Describe the feature]

IMPLEMENT AS A VERTICAL SLICE:
1. Database schema changes (if needed)
2. Backend service implementation
3. API endpoint
4. Frontend UI integration

FILES TO MODIFY:
- backend/[paths]
- frontend/[paths]

ACCEPTANCE CRITERIA:
- [criterion 1]
- [criterion 2]

CONSTRAINTS:
- Backend owns business logic
- Frontend must call backend API only
- No architecture changes without updating docs/ARCHITECTURE.md
- No new dependencies without approval
- Follow docs/CODING_RULES.md

After implementation:
1. Confirm the feature works end-to-end
2. Update docs/TASKS.md
3. Update API or DB documentation if applicable
```
