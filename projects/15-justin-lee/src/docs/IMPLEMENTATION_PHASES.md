# Implementation Phases

## Phase 0: Repository and Application Scaffolding

**Objective:** Set up the monorepo structure, dev tooling, and both frontend and backend project scaffolds with a verified dev server workflow.

**Deliverables:**
- Monorepo structure with `/frontend` and `/backend` directories
- React + TypeScript + Vite frontend scaffold with Tailwind CSS and Shadcn/ui configured
- FastAPI backend scaffold with project structure, virtual environment, and dependency management
- Supabase project initialized (or local PostgreSQL dev setup)
- `.env` and environment variable management
- Basic health-check endpoint (`GET /api/health`)
- Frontend can call backend health endpoint
- ESLint/Prettier configured for frontend, Ruff/Black configured for backend
- Git hooks or CI lint checks

**Dependencies:** None

**Out of Scope:** Any business logic, authentication implementation, UI design beyond hello-world scaffolding

---

## Phase 1: Workspace and Upload Flow

**Objective:** Deliver user authentication, workspace CRUD, and document upload with status tracking.

**Deliverables:**
- User authentication via Supabase Auth (email/password at minimum)
- `users` and `workspaces` tables created and migrated
- Workspace CRUD API: create, list, get, update, delete
- `documents` table with `processing_status` field
- Document upload API: accept file, store to file storage, create DB record
- Upload supports labeling (e.g., "Midterm 1", "HW 4") and source type classification
- Frontend: workspace list, workspace detail, upload UI with status indicators
- Processing status flow: `uploaded` → `parsing` → `indexed` → `ready` / `failed`

**Dependencies:** Phase 0 complete

**Out of Scope:** Parsing, chunking, embedding, generation — just upload and status tracking

---

## Phase 2: Document Ingestion and Parsing Pipeline

**Objective:** Parse uploaded documents into normalized structured representations, chunk them, generate embeddings, and index them in the vector store.

**Deliverables:**
- Document Processing Service: invokes Docling/Marker on uploaded files
- `document_processing_jobs` table tracking parser invocation and status
- `parsed_documents` table storing normalized structured output
- Chunking logic that preserves semantic instructional units (problems, examples, definitions)
- `chunks` table with type labels, topic labels, position, and metadata
- Embedding generation for each chunk
- `chunk_embeddings` table with vector store references
- ChromaDB integration for development vector storage
- Parser fallback: try Marker if Docling confidence is low
- Document status updated to `indexed` / `ready` after successful processing

**Dependencies:** Phase 1 (documents exist in DB and file storage)

**Out of Scope:** Professor Profile construction, generation, grading

---

## Phase 3: Retrieval and Professor Profile

**Objective:** Build the retrieval layer and Professor Profile construction pipeline.

**Deliverables:**
- Retrieval Service: semantic search over chunks with metadata filtering
- Task-conditioned retrieval (different retrieval behavior for profile vs. generation vs. grading)
- Scope-aware filtering (user constraints like "Only Notes 3–8" enforced via metadata)
- Source-aware weighting (prior exams weighted higher than single HW problems)
- Professor Profile Service: aggregates retrieval signals into structured profile
- `professor_profiles` and `professor_profile_versions` tables
- Profile includes: topic distribution, question-type distribution, difficulty tendencies, exam structure
- Profile versioning: new version created when materials are added/changed
- Frontend: Profile insights view showing inferred tendencies
- LlamaIndex integration for RAG orchestration

**Dependencies:** Phase 2 (chunks and embeddings exist)

**Out of Scope:** Generation, grading, analytics

---

## Phase 4: Practice and Exam Generation

**Objective:** Generate practice problem sets and simulated exams using the Professor Profile and retrieved evidence, with multi-stage quality control.

**Deliverables:**
- Generation Service: accepts generation requests with format, scope, and difficulty controls
- `generation_requests` table tracking request status
- `generated_exams` and `generated_questions` tables
- Multi-stage generation pipeline (at minimum: draft → validation → assembly)
- Answer key and explanation generation
- Novelty checking against source chunks
- MCQ answer-position distribution correction
- Difficulty calibration against profile tendencies
- Pandoc integration for PDF export of generated exams
- Frontend: generation configuration UI, generated exam viewer, PDF download

**Dependencies:** Phase 3 (retrieval and profiles exist)

**Out of Scope:** Grading, analytics, regeneration

---

## Phase 5: Submission and Grading

**Objective:** Accept student answer submissions and produce structured diagnostic grading output.

**Deliverables:**
- `submissions` and `submission_answers` tables
- Grading Service: evaluates each answer using LLM with retrieved context
- `grading_results` table with correctness label, score, diagnostic explanation, concept label
- `error_classifications` table with error type and severity
- Error categories: wrong method, formula misuse, computation error, interpretation error, incomplete reasoning
- Partial correctness support
- Frontend: answer submission UI, grading results view with per-question feedback

**Dependencies:** Phase 4 (generated exams exist to submit answers against)

**Out of Scope:** Analytics aggregation, regeneration, trend tracking

---

## Phase 6: Analytics and Regeneration

**Objective:** Aggregate grading signals into longitudinal analytics and drive adaptive targeted practice regeneration.

**Deliverables:**
- Analytics Service: aggregates grading results into concept mastery, error distributions, trends
- `analytics_snapshots` table with serialized mastery state, error distribution, trend metrics
- Concept mastery modeling (continuous scores or categorical levels)
- Performance trend tracking across sessions
- `regeneration_requests` table linking weakness signals to follow-up generation
- Targeted regeneration pipeline: generates focused practice on weak concepts/question types
- Frontend: analytics dashboard with mastery heatmap, error distribution chart, performance timeline, topic chart
- Recharts integration for data visualization

**Dependencies:** Phase 5 (grading results exist to aggregate)

**Out of Scope:** Advanced ML-based mastery prediction, external integrations

---

## Phase 7: Polish and Reliability

**Objective:** Harden the system, improve UX, handle edge cases, and prepare for deployment.

**Deliverables:**
- Error handling and user-facing error messages for all failure modes
- Loading states and progress indicators for async workflows (parsing, generation, grading)
- Rate limiting and input validation
- Security review: auth guards on all endpoints, row-level security in Supabase
- Responsive layout adjustments
- Deployment configuration: Vercel (frontend), Render/Railway (backend), Supabase (DB)
- End-to-end smoke tests for the core loop
- Documentation: README, deployment guide, environment setup guide

**Dependencies:** Phases 0–6 substantially complete

**Out of Scope:** Mobile apps, microservice extraction, LMS integrations, fine-tuning
