# Database Schema

## Storage Split

| Store | Technology | What Goes There |
|---|---|---|
| **Relational** | Supabase / PostgreSQL | All structured application data (tables below) |
| **Vector** | ChromaDB (dev) / pgvector / Pinecone | Chunk embedding vectors |
| **File** | Supabase Storage / local filesystem (dev) | Uploaded documents, generated PDF artifacts |

---

## User and Workspace Entities

> **RLS:** `migrations/003_rls_policies.sql` enables row-level security for `users`, `workspaces`, and `documents`. `migrations/013_phase7_rls_audit.sql` completes the missing `users` self-service insert/delete policies identified during the Phase 7 security audit.

### `users`

Primary user accounts.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `email` | VARCHAR | Unique |
| `display_name` | VARCHAR | Optional |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `workspaces`

Logical study contexts (one per course/exam prep environment).

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK → users) | |
| `title` | VARCHAR | |
| `course_code` | VARCHAR | Optional |
| `description` | TEXT | Optional |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Document and Parsing Entities

### `documents`

Uploaded source materials.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `workspace_id` | UUID (FK → workspaces) | |
| `source_type` | VARCHAR | lecture_slides, homework, prior_exam, practice_test, notes |
| `file_name` | VARCHAR | Original filename |
| `upload_label` | VARCHAR | User-provided label (e.g., "Midterm 1") |
| `file_path` | VARCHAR | Object storage reference |
| `processing_status` | VARCHAR | uploaded, parsing, parsed, indexed, ready, failed |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `document_processing_jobs`

Tracks parser invocation and status.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `document_id` | UUID (FK → documents) | |
| `parser_used` | VARCHAR | Nullable until claimed by a worker; e.g. docling, marker, native_markdown, plain_text |
| `status` | VARCHAR | queued, running, completed, failed |
| `confidence_score` | FLOAT | Optional parsing confidence |
| `error_message` | TEXT | Nullable |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `parsed_documents`

Normalized structured representations.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `document_id` | UUID (FK → documents) | Unique: one current parsed representation per document |
| `normalized_content` | TEXT | Structured Markdown |
| `structural_metadata` | JSONB | Parser metadata, section/layout metadata, job linkage |
| `created_at` | TIMESTAMP | |

---

## Retrieval and Chunk Entities

### `chunks`

Semantic instructional units extracted from parsed documents.

| Field | Type | Notes |
|---|---|---|
| `chunk_id` | UUID (PK) | |
| `document_id` | UUID (FK → documents) | Links chunk rows back to the uploaded source document |
| `content` | TEXT | Chunked Markdown content |
| `position` | INTEGER | Position within document |
| `chunk_type_label` | VARCHAR | example, definition, problem, solution, theorem, section |
| `topic_label` | VARCHAR | Optional inferred topic |
| `created_at` | TIMESTAMP | |

### `chunk_embeddings`

References to vectorized representations.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `chunk_id` | UUID (FK → chunks.chunk_id) | |
| `vector_store_id` | VARCHAR | External vector store reference |
| `vector_store_collection` | VARCHAR | Chroma collection name used for the chunk |
| `embedding_model` | VARCHAR | Model identifier |
| `created_at` | TIMESTAMP | |

> **Note:** The actual embedding vectors live in ChromaDB / pgvector, not in rows here. This table provides the relational link.

---

## Professor Profile Entities

### `professor_profiles`

One active profile per workspace. Stores the currently active Professor Profile JSON for fast reads.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `workspace_id` | UUID (FK → workspaces) | Unique: one active profile row per workspace |
| `version` | INTEGER | Active version number |
| `topic_distribution` | JSONB | Soft topic weighting |
| `question_type_distribution` | JSONB | Question-type tendencies |
| `difficulty_profile` | JSONB | Difficulty tendencies |
| `exam_structure_profile` | JSONB | Inferred exam structure |
| `evidence_summary` | JSONB | Summary of evidence sources |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `professor_profile_versions`

Versioned snapshots of inferred tendencies. New version created when materials change; each row is an immutable historical snapshot.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `professor_profile_id` | UUID (FK → professor_profiles) | |
| `version` | INTEGER | Version number within a professor profile |
| `topic_distribution` | JSONB | Soft topic weighting |
| `question_type_distribution` | JSONB | Question-type tendencies |
| `difficulty_profile` | JSONB | Difficulty tendencies |
| `exam_structure_profile` | JSONB | Inferred exam structure |
| `evidence_summary` | JSONB | Summary of evidence sources |
| `created_at` | TIMESTAMP | |

---

## Generation and Exam Entities

> **Migration:** `migrations/008_generation_tables.sql` — creates `generation_requests`, `generated_exams`, `generated_questions` with CHECK constraints and RLS policies scoped to workspace owner. `migrations/010_generated_questions_options.sql` — adds `options` JSONB. `migrations/011_generated_questions_points_possible.sql` — adds `points_possible` NUMERIC.

### `generation_requests`

User-issued generation requests.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `workspace_id` | UUID (FK → workspaces) | |
| `request_type` | VARCHAR | practice_set, simulated_exam, targeted_regeneration |
| `scope_constraints` | JSONB | Scope filter settings |
| `generation_config` | JSONB | Format, difficulty, question count, etc. |
| `status` | VARCHAR | queued, running, completed, failed |
| `created_at` | TIMESTAMP | |

### `generated_exams`

Generated practice sets and simulated exams.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `generation_request_id` | UUID (FK → generation_requests) | |
| `workspace_id` | UUID (FK → workspaces) | |
| `title` | VARCHAR | |
| `exam_mode` | VARCHAR | practice, exam, targeted_practice |
| `format_type` | VARCHAR | mcq, frq, mixed |
| `rendered_artifact_path` | VARCHAR | Optional PDF path |
| `created_at` | TIMESTAMP | |

### `generated_questions`

Individual questions within a generated exam.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `generated_exam_id` | UUID (FK → generated_exams) | |
| `question_order` | INTEGER | |
| `question_text` | TEXT | |
| `question_type` | VARCHAR | mcq, frq, calculation, proof |
| `difficulty_label` | VARCHAR | |
| `topic_label` | VARCHAR | |
| `answer_key` | TEXT | Expected answer or rubric |
| `explanation` | TEXT | Optional |
| `options` | JSONB | Ordered MCQ answer-choice strings; `[]` for non-MCQ. Added in migration 010. |
| `points_possible` | NUMERIC | Rubric weight; defaults to 1.0. Added in migration 011. |
| `created_at` | TIMESTAMP | |

---

## Submission and Grading Entities

> **RLS:** `migrations/009_submission_grading_tables.sql` creates the submission/grading tables and their initial RLS policies. `migrations/013_phase7_rls_audit.sql` completes the missing `submission_answers` update/delete, `grading_results` delete, and `error_classifications` update policies.

### `submissions`

A user's submitted answers for a generated exam.

> **Migration:** `migrations/009_submission_grading_tables.sql` — creates `submissions`, `submission_answers`, `grading_results`, `error_classifications` with CHECK constraints and RLS policies scoped to workspace owner.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `workspace_id` | UUID (FK → workspaces) | Scoping for route-level access |
| `user_id` | UUID (FK → users) | |
| `generated_exam_id` | UUID (FK → generated_exams) | |
| `status` | VARCHAR | submitted, grading, graded, failed |
| `submitted_at` | TIMESTAMP | Optional |
| `overall_score` | NUMERIC | Aggregate score after grading |
| `total_possible` | NUMERIC | Maximum possible score |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `submission_answers`

Per-question submitted responses.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `submission_id` | UUID (FK → submissions) | |
| `generated_question_id` | UUID (FK → generated_questions) | |
| `answer_content` | TEXT | |
| `created_at` | TIMESTAMP | |

### `grading_results`

Structured evaluation for each answer.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `submission_answer_id` | UUID (FK → submission_answers) | |
| `correctness_label` | VARCHAR | correct, partial, incorrect |
| `score_value` | NUMERIC | Points awarded (0 to points_possible) |
| `points_possible` | NUMERIC | Maximum points for this question |
| `diagnostic_explanation` | TEXT | |
| `concept_label` | VARCHAR | Mapped concept |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `error_classifications`

Normalized error-type labels.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `grading_result_id` | UUID (FK → grading_results) | |
| `error_type` | VARCHAR | wrong_method, formula_misuse, computation_error, interpretation_error, incomplete_reasoning |
| `severity` | VARCHAR | Optional: minor, moderate, major |
| `description` | TEXT | Optional explanation of the error |
| `created_at` | TIMESTAMP | |

---

## Analytics and Regeneration Entities

> **Migration:** `migrations/012_analytics_regeneration_tables.sql` — creates `analytics_snapshots` and `regeneration_requests` with CHECK constraints and RLS policies scoped to workspace owner.

### `analytics_snapshots`

Periodic mastery and error-state summaries.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `workspace_id` | UUID (FK → workspaces) | |
| `user_id` | UUID (FK → users) | |
| `concept_mastery_state` | JSONB | Serialized mastery summary |
| `error_distribution` | JSONB | Error aggregation summary |
| `performance_trend_summary` | JSONB | Trend metrics |
| `created_at` | TIMESTAMP | |

### `regeneration_requests`

Targeted follow-up generation triggered by analytics.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `workspace_id` | UUID (FK → workspaces) | |
| `user_id` | UUID (FK → users) | |
| `source_analytics_snapshot_id` | UUID (FK → analytics_snapshots) | |
| `target_concepts` | JSONB | Concept targets |
| `request_status` | VARCHAR | queued, running, completed, failed |
| `generated_exam_id` | UUID (FK → generated_exams, nullable) | Populated once targeted practice exam is generated |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Design Principles

- **Separation of source and derived data:** Uploaded documents, parsed outputs, generated artifacts, and analytics are stored in separate tables.
- **Versioning:** Professor Profiles support versioned snapshots as evidence changes.
- **Traceability:** All generated content, grading results, and analytics state are linked back to their source workspace, materials, and submissions.
- **Extensibility:** JSONB fields for serialized data allow schema evolution without migrations for internal structures.
