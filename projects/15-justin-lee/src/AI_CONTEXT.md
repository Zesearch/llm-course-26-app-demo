# AI Context

## What This Project Is

**ExamProfile AI** is a STEM-focused, web-first exam simulation and weakness analytics platform. It ingests course materials (slides, homework, exams), builds a **Professor Profile** of instructor assessment tendencies, and generates course-specific practice problems and simulated exams. Students submit answers and receive structured diagnostic grading, concept-level weakness analytics, and adaptive targeted practice.

## What This Project Is NOT

- Not a generic AI chatbot or tutor
- Not a homework solver
- Not an essay-grading tool
- Not a mobile app
- Not a microservice system
- Not a replacement for instruction

## Current Development Phase

Current phase is defined in `docs/IMPLEMENTATION_PHASES.md`. You are currently on **Phase 7 — Polish + reliability**.

The system is being implemented sequentially:

- Phase 0 — Repository scaffolding
- Phase 1 — Workspace and document upload
- Phase 2 — Document ingestion pipeline
- Phase 3 — Retrieval + Professor Profile
- Phase 4 — Generation
- Phase 5 — Grading
- Phase 6 — Analytics + regeneration
- Phase 7 — Polish + reliability

Current implementation status: **Phase 7 — COMPLETE**.

AI coding sessions must **never skip ahead**.

Always check:
- `docs/IMPLEMENTATION_PHASES.md`
- `docs/TASKS.md`

## Architecture (Non-Negotiable)

- **Modular monolith** — all backend services in one deployable Python app
- **React + TypeScript + Tailwind + Shadcn/ui** frontend (presentation only)
- **FastAPI + Python** backend (owns all business logic and AI orchestration)
- **Supabase / PostgreSQL** relational store
- **ChromaDB** vector store (dev)
- **Gemini 1.5 Flash** primary LLM
- **LlamaIndex** RAG orchestration
- **Docling / Marker** document parsing

## Project Directory Map

```
ExamReplica/
├── AI_CONTEXT.md
├── PROMPT_TEMPLATE.md
├── README.md
├── docs/
│   ├── PROJECT_OVERVIEW.md
│   ├── REQUIREMENTS.md
│   ├── IMPLEMENTATION_PHASES.md
│   ├── TASKS.md
│   ├── ARCHITECTURE.md
│   ├── AI_PIPELINE.md
│   ├── DB_SCHEMA.md
│   ├── API_CONTRACTS.md
│   └── CODING_RULES.md
├── backend/
│   ├── main.py
│   ├── config/
│   ├── routes/
│   ├── models/
│   └── services/
│       ├── document_processing/
│       ├── retrieval/
│       ├── professor_profile/
│       ├── generation/
│       ├── grading/
│       └── analytics/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── api/
│       └── hooks/
└── Specifications/
```

## Core Rules

- Generation is **never** a single LLM call — multi-stage quality control is mandatory
- Grading is **never** binary correct/incorrect — structured error classification is required
- Professor Profile tendencies are **soft signals**, not rigid deterministic percentages
- Backend owns orchestration — frontend never calls LLMs or vector stores directly
- TypeScript strict mode. Python type hints on everything.
- No fake production logic — stubs must be labeled `# STUB`
- No hidden globals. No architecture drift without updating docs.

## Read These Files First

1. `docs/PROJECT_OVERVIEW.md` — what the system is
2. `docs/REQUIREMENTS.md` — binding constraints (most important file)
3. `docs/IMPLEMENTATION_PHASES.md` — what phase you are in
4. `docs/TASKS.md` — what to build next

Then read the file relevant to your task:
- Backend work → `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md`
- AI/pipeline work → `docs/AI_PIPELINE.md`
- Database work → `docs/DB_SCHEMA.md`
- Any work → `docs/CODING_RULES.md`

## AI Coding Session Checklist

Before writing code:

1. Read `AI_CONTEXT.md` (this file)
2. Read `docs/REQUIREMENTS.md`
3. Identify the current phase in `docs/IMPLEMENTATION_PHASES.md`
4. Identify the task in `docs/TASKS.md`
5. Identify relevant documentation:
   - Backend work → `docs/ARCHITECTURE.md` + `docs/API_CONTRACTS.md`
   - AI pipeline → `docs/AI_PIPELINE.md`
   - Database → `docs/DB_SCHEMA.md`
6. Define acceptance criteria
7. List files to create or modify
8. Only then write implementation code

## Do NOT Do This

- Do not invent features outside the spec
- Do not introduce microservices, message queues, or new storage layers
- Do not collapse generation into a single prompt call
- Do not make grading output only correct/incorrect
- Do not put business logic in the frontend
- Do not add mobile, essay-grading, LMS integration, or social features
- Do not skip multi-stage generation "to save time"
- Do not create files outside the established project structure
- Do not change architecture without updating `docs/ARCHITECTURE.md`

## Always Do This

- Use TypeScript strict mode and Python type hints
- Follow the naming conventions in `docs/CODING_RULES.md`
- Update `docs/TASKS.md` when completing a task
- Update `docs/API_CONTRACTS.md` when adding an endpoint
- Update `docs/DB_SCHEMA.md` when adding a migration
- Write production-minded code, not hackathon code
- Handle errors explicitly — no silent failures
- Keep functions short (< 50 lines)
- One responsibility per file

## Preferred Development Style

Development follows a **vertical slice approach**.

Complete one feature end-to-end before starting the next.

Order of implementation:

```
Database
  ↓
Backend service
  ↓
API endpoint
  ↓
Frontend UI
  ↓
Testing
  ↓
Documentation update
```

## Current Development Workflow

1. Pick the next task from `docs/TASKS.md`
2. Confirm you are in the correct phase per `docs/IMPLEMENTATION_PHASES.md`
3. State what you will build and the acceptance criteria
4. Build the feature as a vertical slice (DB → backend → API → frontend)
5. Verify the deliverable works
6. Update `docs/TASKS.md` status
7. Move to the next task
