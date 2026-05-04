# Architecture

## Overview

ExamProfile AI is a **modular monolith** — all backend services run within a single deployable Python application, organized into clearly separated modules with explicit interfaces. This avoids the overhead of distributed microservices during MVP while preserving clean boundaries for future extraction.

## System Layers

```
┌───────────────────────────────────────────────────┐
│                   Frontend Layer                   │
│         React / TypeScript / Tailwind / Shadcn     │
└──────────────────────┬────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼────────────────────────────┐
│              Application API Layer                 │
│                    FastAPI                          │
├───────────────────────────────────────────────────┤
│               Core Backend Services                │
│  ┌──────────────┐ ┌──────────────┐ ┌───────────┐  │
│  │  Doc Process  │ │   Profile    │ │ Retrieval │  │
│  └──────────────┘ └──────────────┘ └───────────┘  │
│  ┌──────────────┐ ┌──────────────┐ ┌───────────┐  │
│  │  Generation   │ │   Grading    │ │ Analytics │  │
│  └──────────────┘ └──────────────┘ └───────────┘  │
├───────────────────────────────────────────────────┤
│                  Storage Layer                      │
│  ┌──────────────┐ ┌──────────────┐ ┌───────────┐  │
│  │  Relational   │ │   Vector     │ │   File    │  │
│  │  Supabase/PG  │ │  ChromaDB    │ │  Storage  │  │
│  └──────────────┘ └──────────────┘ └───────────┘  │
├───────────────────────────────────────────────────┤
│              External Dependencies                  │
│     Docling / Marker     │     Gemini Flash        │
└───────────────────────────────────────────────────┘
```

## Frontend Layer

- **Stack:** React, TypeScript, Tailwind CSS, Shadcn/ui, Recharts
- **Responsibilities:** Rendering, navigation, form handling, file upload UI, exam viewer, analytics dashboard, PDF download
- **Does NOT contain:** Business logic, AI orchestration, direct DB access

## Application API Layer

- **Stack:** FastAPI (Python)
- **Responsibilities:** Request routing, authentication, input validation, orchestrating service calls, returning structured responses
- **Auth:** Supabase Auth (JWT-based)

## Core Backend Services

| Service | Responsibility |
|---|---|
| **Document Processing** | Parse uploads via Docling/Marker, normalize, chunk, embed, index |
| **Professor Profile** | Aggregate evidence into versioned profile (topics, question types, difficulty, structure) |
| **Retrieval** | Task-conditioned semantic search with metadata filtering and source weighting |
| **Generation** | Multi-stage exam/practice generation with quality control |
| **Grading** | Structured evaluation with error classification and concept mapping |
| **Analytics** | Aggregate mastery, error distributions, trends; drive regeneration |

Each service is a Python module under `backend/services/`. Services communicate through direct function/class calls (not HTTP) within the monolith.

Current implementation note:
- Document parsing jobs are dispatched inside the monolith with FastAPI `BackgroundTasks`, tracked in PostgreSQL via `document_processing_jobs`, and currently execute parse persistence followed immediately by semantic Markdown chunking.
- The same background job now continues into embedding generation and local ChromaDB indexing before the document is marked `indexed`.

## Storage Layer

| Store | Technology | Contents |
|---|---|---|
| **Relational** | Supabase / PostgreSQL | Users, workspaces, documents, profiles, exams, submissions, grading, analytics |
| **Vector** | ChromaDB (dev) / pgvector / Pinecone (optional prod) | Chunk embeddings for semantic retrieval |
| **File** | Supabase Storage or local filesystem (dev) | Uploaded files, generated PDF artifacts |

## External Dependencies

| Dependency | Purpose |
|---|---|
| **Docling (IBM)** | Primary document parser for complex PDFs |
| **Marker** | Fallback parser with strong math support |
| **Pandoc** | Markdown → PDF export for generated exams |
| **Gemini Flash** | LLM for generation, grading, profile construction |
| **LlamaIndex** | RAG orchestration framework |

## End-to-End Data Flows

### Course Modeling Flow
```
Upload → Parse → Normalize → Chunk → Embed → Index → Retrieve → Build Profile
```

### Generation Flow
```
User Config → Retrieve Evidence → Load Profile → Draft → Validate → Novelty Check → Calibrate → Assemble → Deliver
```

### Grading + Analytics Flow
```
Submit Answers → Grade Each → Classify Errors → Map to Concepts → Aggregate Analytics → Surface Insights → Regenerate Targeted Practice
```

## Key Architecture Decisions

1. **Modular monolith over microservices** — MVP simplicity, single deployment, easy debugging
2. **Backend owns orchestration** — Frontend never calls LLMs or vector stores directly
3. **Service separation within monolith** — Clean module boundaries enable future extraction
4. **Task-conditioned retrieval** — Different retrieval strategies for profile, generation, grading, and regeneration
5. **Multi-stage generation** — Quality control is structural, not an afterthought
