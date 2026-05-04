# Tasks

## Phase 0: Repository and Application Scaffolding

### T-001: Initialize monorepo structure
- **Phase:** 0
- **Status:** Complete
- **Goal:** Create `/frontend` and `/backend` directories with proper `.gitignore` entries
- **Acceptance Criteria:**
  - Repo has `frontend/` and `backend/` directories
  - `.gitignore` covers `node_modules/`, `__pycache__/`, `.env`, `venv/`, `dist/`
  - All context `.md` files are at repo root

### T-002: Scaffold React frontend
- **Phase:** 0
- **Status:** Complete
- **Goal:** Initialize React + TypeScript frontend with Tailwind CSS and Shadcn/ui
- **Acceptance Criteria:**
  - `frontend/` contains a working Next.js + React + TypeScript project (App Router)
  - Tailwind CSS is configured and working
  - Shadcn/ui is installed and a test component renders
  - `npm run dev` starts the dev server
  - TypeScript strict mode is enabled in `tsconfig.json`
  - ESLint and Prettier are configured

### T-003: Scaffold FastAPI backend
- **Phase:** 0
- **Status:** Complete
- **Goal:** Initialize FastAPI project with proper structure, dependencies, and virtual environment
- **Acceptance Criteria:**
  - `backend/` contains a FastAPI project with `main.py`
  - Python virtual environment set up with `requirements.txt` or `pyproject.toml`
  - Ruff and/or Black configured for formatting
  - Type hints used on all function signatures
  - Project structure has `services/`, `models/`, `routes/`, `config/` directories

### T-004: Health check endpoint
- **Phase:** 0
- **Status:** Complete
- **Goal:** Backend serves a health check endpoint; frontend can call it
- **Acceptance Criteria:**
  - `GET /api/health` returns `{ "status": "ok" }`
  - Frontend has an API client module that calls the health endpoint
  - CORS is configured to allow frontend dev server origin

### T-005: Environment and Supabase setup
- **Phase:** 0
- **Status:** Complete
- **Goal:** Set up environment variable management and Supabase project
- **Acceptance Criteria:**
  - `.env.example` files exist for both frontend and backend
  - Supabase project is created (or local PG dev config documented)
  - Backend can connect to the database
  - Supabase client is initialized in backend config

---

## Phase 1: Workspace and Upload Flow

### T-101: User authentication
- **Phase:** 1
- **Status:** Complete
- **Goal:** Implement user auth via Supabase Auth
- **Acceptance Criteria:**
  - Users can sign up and log in with email/password
  - JWT tokens are sent with API requests
  - Backend validates Supabase JWT on protected routes
  - `users` table is populated on sign-up

### T-102: Workspace CRUD API
- **Phase:** 1
- **Status:** Complete
- **Goal:** Full workspace CRUD endpoints
- **Acceptance Criteria:**
  - `POST /api/workspaces` creates a workspace
  - `GET /api/workspaces` lists user's workspaces
  - `GET /api/workspaces/{id}` returns workspace details
  - `PUT /api/workspaces/{id}` updates workspace
  - `DELETE /api/workspaces/{id}` deletes workspace
  - `workspaces` table created and migrated
  - Workspaces are scoped to the authenticated user

### T-103: Workspace UI
- **Phase:** 1
- **Status:** Complete
- **Goal:** Frontend workspace list and detail views
- **Acceptance Criteria:**
  - Workspace list page shows all workspaces
  - Create workspace form works
  - Clicking a workspace navigates to detail view
  - Delete and edit workspace actions work

### T-104: Document upload API
- **Phase:** 1
- **Status:** Complete
- **Goal:** Upload documents to a workspace with labeling
- **Acceptance Criteria:**
  - `POST /api/workspaces/{id}/documents` accepts file upload
  - File is stored in file storage (Supabase Storage or local)
  - `documents` table record created with `processing_status: "uploaded"`
  - Upload accepts `source_type` and `upload_label` fields
  - `GET /api/workspaces/{id}/documents` lists documents with status

### T-105: Document upload UI
- **Phase:** 1
- **Status:** Complete
- **Goal:** Frontend upload interface with status indicators
- **Acceptance Criteria:**
  - Drag-and-drop or file picker upload
  - User can set source type and upload label
  - Document list shows processing status (uploaded, parsing, indexed, ready, failed)
  - Status updates are visible without page refresh (polling or WebSocket)

---

## Phase 2: Document Ingestion and Parsing Pipeline

### T-201: Document parsing service and background jobs
- **Phase:** 2
- **Status:** Complete
- **Goal:** Parse uploaded documents asynchronously into Markdown and persist the result
- **Acceptance Criteria:**
  - `document_processing_jobs` and `parsed_documents` tables exist with migrations
  - `POST /api/workspaces/{id}/documents` queues parsing immediately after upload
  - Document status transitions through `uploaded` → `parsing` → `parsed` / `failed`
  - Parsed Markdown is stored in `parsed_documents.normalized_content`
  - Backend logs job progress with Python `logging`
  - A backend test or script exists to exercise the parsing flow on a local document

### T-202: Semantic Markdown chunking
- **Phase:** 2
- **Status:** Complete
- **Goal:** Split parsed Markdown into semantic instructional units and persist them for later retrieval
- **Acceptance Criteria:**
  - `chunks` table exists with `chunk_id`, `document_id`, `content`, `position`, `chunk_type_label`, and `topic_label`
  - The background document processing job calls chunking immediately after parsed Markdown is saved
  - Chunk boundaries prefer Markdown headers and semantic instructional markers over naive fixed-size splitting
  - A pytest file verifies chunk splitting behavior on mock Markdown content

### T-203: Embedding generation and ChromaDB indexing
- **Phase:** 2
- **Status:** Complete
- **Goal:** Generate embeddings for persisted chunks, index them in local ChromaDB, and expose final `indexed` status in the document workflow
- **Acceptance Criteria:**
  - `chunk_embeddings` table exists with vector-store tracking metadata
  - The background document processing job runs parse → chunk → embed → index without blocking the request lifecycle
  - Chunk vectors are stored in a persistent local ChromaDB collection with document and position metadata
  - Document status transitions through `uploaded` → `parsing` → `indexed` on success
  - A backend script can query ChromaDB and return the matching chunk for a test keyword

---

## Phase 3: Retrieval and Professor Profile

### T-301: Database Schema Updates for Professor Profiles
- **Phase:** 3
- **Status:** Complete
- **Goal:** Create the database tables to store the structured JSON data about a professor.
- **Acceptance Criteria:**
  - `professor_profiles` and `professor_profile_versions` tables created via Supabase migration
  - Tables store structured JSON data about a professor's tendencies, topic distribution, etc.
  - Pydantic models correspond to the schema changes

### T-302: Retrieval Service and LlamaIndex Integration
- **Phase:** 3
- **Status:** Complete
- **Goal:** Build the backend RetrievalService using LlamaIndex to query ChromaDB for context-aware chunks.
- **Acceptance Criteria:**
  - Semantic search over chunks with metadata filtering
  - LlamaIndex integrated to coordinate RAG operations
  - Supports task-conditioned retrieval (e.g., grab syllabi and exams for profile generation)

### T-303: Professor Profile Service (LLM Orchestrator)
- **Phase:** 3
- **Status:** Complete
- **Goal:** Python service that takes retrieved chunks, feeds Gemini 1.5 Flash, and outputs a strict JSON profile.
- **Acceptance Criteria:**
  - Retrieves all relevant chunks for a specific workspace
  - Instructs Gemini 1.5 Flash to act as an educational analyst
  - Outputs a structured JSON object detailing trends and topic distribution

### T-304: Frontend Profile Insights UI
- **Phase:** 3
- **Status:** Complete
- **Goal:** Build a dashboard page in the React frontend that displays the JSON profile from the backend.
- **Acceptance Criteria:**
  - Fetches the professor profile from the backend API
  - Displays tendencies, difficulty levels, and topic distributions visually
  - Recharts or simple progress bars used for visual insights

---

## Phase 4: Practice and Exam Generation

### T-404: Frontend Generation UI
- **Phase:** 4
- **Status:** Complete
- **Goal:** Build the complete generation UI as a vertical slice within the existing Next.js frontend
- **Acceptance Criteria:**
  - Generation form page with request type, format type, question count (3–30), difficulty, question types, optional topics, and custom prompt
  - Status polling page that polls every 3 seconds and redirects to exam viewer on completion
  - Exam viewer page rendering all questions with MCQ options as A/B/C/D and Show Answer toggle
  - Exam list page with empty state and card-per-exam navigation
  - PDF Download button triggers browser file save via Blob URL
  - All API calls go through the API client module
  - Sidebar navigation includes Generate and Exams links for active workspace
  - TypeScript strict mode, Shadcn/ui components, Tailwind CSS throughout
### T-401: Database schema for generation entities
- **Phase:** 4
- **Status:** Complete
- **Goal:** Create migration and Pydantic models for generation_requests, generated_exams, and generated_questions tables
- **Acceptance Criteria:**
  - `migrations/008_generation_tables.sql` creates all three tables with correct columns, types, FK references, CHECK constraints, and RLS policies
  - `backend/models/generation.py` defines GenerationConfig, ScopeConstraints, GenerationRequestCreate, GenerationRequestRead, GeneratedExamSummary, GeneratedQuestionRead, GeneratedExamDetail
  - All Literal-constrained status/type fields raise ValidationError on invalid values

### T-402: GenerationService — Multi-Stage Pipeline
- **Phase:** 4
- **Status:** Complete
- **Goal:** Implement the 6-stage generation pipeline as a Python service module
- **Acceptance Criteria:**
  - `GenerationService.run_pipeline()` is the single public entry point returning `FinalExamAssembly`
  - All 6 stages (draft → validate → novelty → difficulty → MCQ distribution → assemble) are called sequentially
  - Service does not write to the database
  - All Gemini prompt strings live in `prompts.py`
  - `GenerationError` is a subclass of `AppError`
  - All 6 pytest tests pass

### T-403: Generation API Routes + Background Job
- **Phase:** 4
- **Status:** Complete
- **Goal:** Create all 5 generation endpoints, wire GenerationService into BackgroundTasks, PDF export
- **Acceptance Criteria:**
  - POST /generation-requests returns 202 and dispatches background job
  - GET /generation-requests/{id} returns current status
  - GET /exams returns summaries (no nested questions)
  - GET /exams/{id} returns full exam with ordered questions
  - GET /exams/{id}/export returns PDF via Pandoc (503 if missing)
  - All workspace ownership validated before DB access
  - Router registered in main.py
  - All 7 pytest tests pass

---

## Phase 5: Submission and Grading

### T-501: Database schema for submission and grading entities
- **Phase:** 5
- **Status:** Complete
- **Goal:** Create migration for submissions, submission_answers, grading_results, and error_classifications tables
- **Acceptance Criteria:**
  - `migrations/009_submission_grading_tables.sql` creates all four tables with correct columns, FK references, CHECK constraints, and RLS policies
  - `submissions` has status CHECK (submitted, grading, graded, failed), workspace_id, user_id, overall_score, total_possible
  - `submission_answers` uses `answer_content` (not `student_answer`) and `generated_question_id`
  - `grading_results` uses `correctness_label` (not `is_correct`), `score_value`, `diagnostic_explanation`, `concept_label`, `points_possible`
  - `error_classifications` has CHECK constraint on `error_type` (5 allowed values) and optional `severity` (minor, moderate, major)
  - RLS policies scope through workspace ownership chain
  - Indexes exist on all FK columns

### T-502: Pydantic models for submission and grading
- **Phase:** 5
- **Status:** Complete
- **Goal:** Define type-safe request/response models for submission and grading flows
- **Acceptance Criteria:**
  - `backend/models/submission.py` defines API-facing models: SubmissionCreate, SubmissionCreatedResponse, SubmissionRead, SubmissionAnswerRead, GradingResultRead, ErrorClassificationRead
  - `backend/models/grading.py` defines internal models: GradingResultCreate, ErrorClassificationCreate with Literal-constrained CorrectnessLabel and ErrorType
  - All field names match DB column names (score_value, diagnostic_explanation, concept_label, answer_content)
  - CorrectnessLabel is Literal['correct', 'partial', 'incorrect'] — never a boolean
  - ErrorType is Literal with exactly 5 allowed values
  - All models use Python type hints, no Any

### T-503: Grading service and AI pipeline
- **Phase:** 5
- **Status:** Complete
- **Goal:** Implement grading service that evaluates answers and returns structured results
- **Acceptance Criteria:**
  - `backend/services/grading/service.py` returns `GradingPipelineResult` — does NOT write to DB directly
  - `backend/services/grading/grader.py` implements LLM-based grading with Gemini
  - LLM prompt requires correctness_label (correct/partial/incorrect), score_value, diagnostic_explanation, concept_label, and error_classifications
  - Score values are clamped to [0, points_possible]
  - Invalid JSON or schema validation failures raise `GradingError` (subclass of AppError)
  - Error types are restricted to the 5 canonical values
  - pytest tests mock LLM calls and verify all grading paths including formula_misuse

### T-504: Submission API routes and frontend UI
- **Phase:** 5
- **Status:** Complete
- **Goal:** Create submission/grading endpoints and frontend submission + results UI
- **Acceptance Criteria:**
  - `POST /api/workspaces/{workspace_id}/exams/{exam_id}/submissions` creates submission + answers, dispatches background grading, returns 201
  - `GET /api/workspaces/{workspace_id}/submissions/{submission_id}` returns nested response with correctness_label, score_value, diagnostic_explanation, concept_label, error_classifications
  - Background job sets status = grading → graded (or failed), persists grading_results and error_classifications to DB
  - Both endpoints validate workspace ownership
  - Router registered in main.py under /api prefix
  - Frontend ExamViewer manages answer state and transitions: taking → grading → results
  - GradingStatusPoller polls every 3 seconds, stops on graded/failed
  - GradingResultsViewer shows overall score, per-question cards with colored correctness badges, student answer vs correct answer, diagnostic_explanation, error classification badges
  - All TypeScript types match backend API response shape

---

---

## Phase 6: Analytics and Regeneration

### T-601: Database schema for analytics and regeneration entities
- **Phase:** 6
- **Status:** Complete
- **Goal:** Create migration for analytics_snapshots and regeneration_requests tables
- **Acceptance Criteria:**
  - `migrations/012_analytics_regeneration_tables.sql` creates both tables with FK references, CHECK constraints, and RLS policies scoped to workspace owner
  - `analytics_snapshots` has workspace_id, user_id, concept_mastery_state JSONB, error_distribution JSONB, performance_trend_summary JSONB
  - `regeneration_requests` has workspace_id, user_id, source_analytics_snapshot_id, target_concepts JSONB NOT NULL, request_status CHECK, generated_exam_id (nullable FK → generated_exams), updated_at with trigger
  - Indexes on all FK columns

### T-603: Regeneration Service + POST/GET Regeneration Request Endpoints
- **Phase:** 6
- **Status:** Complete
- **Goal:** Accept targeted practice requests, build a scoped generation config biased toward weak concepts, dispatch the existing GenerationService pipeline, and link the result to a regeneration_requests row
- **Acceptance Criteria:**
  - `backend/models/regeneration.py` — RegenerationRequestCreate (target_concepts, question_count 3–20, format_type), RegenerationRequestResponse
  - `backend/services/regeneration/service.py` — RegenerationService.build_scoped_config() builds GenerationConfig + ScopeConstraints with target_concepts as topics and a focused custom_prompt; run_regeneration_pipeline() runs the existing generation pipeline as a background job, creates generation_requests + generated_exams rows, updates regeneration_requests.generated_exam_id and request_status
  - `POST /api/workspaces/{workspace_id}/regeneration-requests` — validates workspace ownership, ensures an analytics snapshot exists (creates one if needed), creates regeneration_requests row, dispatches background job, returns 202
  - `GET /api/workspaces/{workspace_id}/regeneration-requests/{request_id}` — returns current status and generated_exam_id (null until completed)
  - Both routers registered in backend/main.py
  - Reuses GenerationService.run_pipeline() entirely — no duplicate generation implementation
  - generated_exams.generation_request_id FK satisfied by creating a generation_requests row with request_type='targeted_regeneration'

### T-602: Analytics Service and GET /analytics API Endpoint
- **Phase:** 6
- **Status:** Complete
- **Goal:** Aggregate grading results into concept mastery, error distribution, and performance trend; expose via GET /analytics
- **Acceptance Criteria:**
  - `backend/services/analytics/models.py` — internal Pydantic models: ConceptMasteryEntry, PerformanceTrendEntry, Recommendation, AnalyticsResult
  - `backend/services/analytics/service.py` — AnalyticsStore Protocol, AnalyticsService.compute_analytics(), SupabaseAnalyticsStore, build_analytics_service()
  - `backend/services/analytics/snapshot.py` — persist_analytics_snapshot() writes one analytics_snapshots row
  - `backend/models/analytics.py` — API response models: AnalyticsResponse, ConceptMasteryRead, PerformanceTrendRead, RecommendationRead
  - `backend/routes/analytics.py` — GET /workspaces/{workspace_id}/analytics; validates workspace ownership; returns empty object (not 404) when no graded submissions exist; persists snapshot fire-and-forget
  - Router registered in backend/main.py
  - Mastery levels: not_started (0 questions), developing (<0.4), proficient (<0.7), strong (>=0.7)
  - Recommendations: concepts with mastery < 0.5 and error types with >= 3 occurrences; up to 5 returned
  - `backend/tests/test_analytics_service.py` — 9 tests covering empty workspace, mastery averaging, level thresholds, error aggregation, recommendation triggers, trend ordering

### T-604: Frontend Analytics Dashboard (Live Data + Recharts)
- **Phase:** 6
- **Status:** Complete
- **Goal:** Replace mock analytics page with live API data, Recharts visualizations, and targeted practice flow
- **Acceptance Criteria:**
  - Workspace selector `<Select>` at top of page fetches user's workspaces and re-fetches analytics on change
  - `getAnalytics`, `postRegenerationRequest`, `getRegenerationRequest` added to `apiClient.ts` with matching TypeScript types
  - Loading spinner while fetching analytics; empty state when no graded submissions exist; error display on failure
  - Progress tab: `LineChart` (score over time by session) + `PieChart` (error distribution)
  - Concepts tab: horizontal `BarChart` with concepts on Y-axis, color-coded by mastery level (strong/proficient/developing/not_started), with legend
  - Recommendations tab: one card per recommendation with concept label, reason, and "Start Targeted Practice" button
  - "Start Targeted Practice" POSTs regeneration request, polls every 3 seconds, redirects to `/dashboard/workspaces/{id}/exams/{examId}` on completion
  - Per-card loading spinner + "Generating…" label while polling; error state with retry on failure
  - All Recharts components inside `ResponsiveContainer`; recharts imported from existing `package.json` dependency
  - TypeScript strict mode; all types match backend API response shape

---

## Phase 7: Polish and Reliability

### T-701: Backend Hardening — Error Handling, Input Validation, Rate Limiting
- **Phase:** 7
- **Status:** Complete
- **Goal:** Harden all backend routes for production — typed errors, strict input validation, rate limiting, and safe background job failure handling
- **Acceptance Criteria:**
  - `ForbiddenError` (403), `ConflictError` (409), `TooManyRequestsError` (429) added to `backend/models/errors.py`
  - `WorkspaceService.get_or_forbidden()` distinguishes 404 (not found) from 403 (wrong owner) using admin client
  - Pydantic constraints tightened: workspace title ≤ 120, course_code ≤ 20, description ≤ 1000; generation question_count 3–30, custom_prompt ≤ 500; regeneration concepts ≤ 60 chars each
  - In-process sliding-window rate limiter in `backend/middleware/rate_limit.py`; limits: generation 5/min, profile generate 3/min, regeneration 5/min; returns 429 with retry-after message
  - All background jobs (generation, grading, document processing, regeneration) have `try/except` that logs at ERROR and updates status to `"failed"` — no crash propagation
  - 18 tests in `backend/tests/test_phase7_backend_hardening.py`, all passing

### T-702: Frontend UX Hardening — Loading States, Error Messages, Responsive Layout
- **Phase:** 7
- **Status:** Complete
- **Goal:** Harden the existing dashboard UX across workspace, generation, grading, profile, and analytics flows with clear loading states, user-friendly error handling, and tablet-safe responsive layouts
- **Acceptance Criteria:**
  - Shared frontend error utility maps API errors to user-facing messages and retryability
  - Global toast notifications surface async failures instead of silent catches
  - Workspace list/detail, professor profile, generation, exam, grading, and analytics pages all show loading indicators or skeletons during initial async work
  - Async action buttons show spinners and disable while pending
  - Document upload shows upload progress and delete actions require confirmation dialogs
  - Generation and grading polling views show active working indicators with time expectations
  - Dashboard shell uses a responsive sidebar with a header toggle at tablet/mobile widths
  - Workspace, document, and exam list pages include explicit empty states with next-step actions

### T-703: Security Audit — Auth Guards, RLS, Input Sanitization
- **Phase:** 7
- **Status:** Complete
- **Goal:** Harden backend auth enforcement, complete RLS coverage for Phase 6 tables, and remove risky logging or upload handling gaps
- **Acceptance Criteria:**
  - Every non-health router applies `Depends(get_current_user)` at the router level and validates workspace ownership before nested resource access
  - Cross-user access to an existing workspace resolves as 403 via `WorkspaceService.get_or_forbidden()` instead of leaking existence through 404 behavior
  - `migrations/013_phase7_rls_audit.sql` completes missing CRUD policy coverage for `users`, `submission_answers`, `grading_results`, and `error_classifications`
  - Startup fails fast when required secrets are missing: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_JWT_SECRET`, `GEMINI_API_KEY`
  - Upload validation rejects unsupported MIME types with 415 and files larger than 25 MB with 413 before storage write
  - INFO/ERROR logging avoids user-submitted content, tokens, and upstream response bodies

### T-704: Deployment + Documentation + Smoke Tests
- **Phase:** 7
- **Status:** Complete
- **Goal:** Prepare the app for staging deployment, document the full setup flow, and add a standalone smoke test for the core loop
- **Acceptance Criteria:**
  - `frontend/vercel.json` and `backend/render.yaml` exist with deploy-ready build/runtime settings
  - `frontend/.env.example` and `backend/.env.example` document every required environment variable
  - `backend/config/settings.py` supports comma-separated `CORS_ALLOW_ORIGINS` and configurable `CHROMA_PERSIST_PATH`
  - `README.md` covers local development, migrations, tests, and deployment
  - `docs/DEPLOYMENT.md` provides a step-by-step staging deployment guide
  - `backend/scripts/smoke_test.py` exercises the health -> workspace -> profile -> generation -> submission -> analytics -> cleanup loop and exits non-zero on failure

## Future Phases

Tasks for remaining Phase 7 items and beyond will be added as work continues. Refer to `IMPLEMENTATION_PHASES.md` for phase definitions and deliverables.
