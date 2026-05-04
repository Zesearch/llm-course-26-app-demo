# AI Pipeline

## Pipeline Overview

ExamProfile AI uses a **Retrieval-Augmented Generation (RAG)** pipeline. The system does **not** rely on a single LLM call. Every major operation is a staged process designed for grounding, traceability, and quality control.

```
Upload → Parse → Normalize → Chunk → Embed + Index → Retrieve → Profile / Generate / Grade → Update Analytics
```

## Stage 1: Parsing and Normalization

**Input:** Uploaded files (PDF, PPTX, DOCX, TXT)
**Output:** Normalized structured representation (Markdown-like with metadata)

- Upload dispatch is asynchronous: `POST /documents` persists the upload, creates a `document_processing_jobs` row, and hands parsing off to a FastAPI background task.
- Status flow for this slice is `uploaded` → `parsing` → `indexed` / `failed`.
- Primary parser: **Docling** (layout-aware, handles equations and multi-column)
- Fallback parser: **Marker** (strong math support — used when Docling confidence is low)
- Preserves: section headers, problem boundaries, numbered examples, definition blocks
- Each parsed document stores: source type, original filename, upload label, structural metadata
- The same background job immediately hands normalized Markdown to the chunking stage after parse persistence succeeds
- Documents that fail parsing are flagged for user review

> ⚠️ **Implementation Note:** Do not raw-extract PDF text. Academic documents with equations, columns, and diagrams require layout-aware parsing. Naive extraction will corrupt instructional structure.

## Stage 2: Chunking

**Input:** Normalized document representation
**Output:** Semantic chunks stored in `chunks` table

- Chunk boundaries must preserve **meaningful instructional units**:
  - Complete worked examples
  - Single homework problems (with all subparts)
  - Lecture subsections
  - Definition-theorem-example groups
  - Question stems with associated parts
- The splitter should prefer Markdown headers first, then semantic line-level boundaries such as `Question 2:` or `Definition:`
- Do not split mathematical reasoning or multi-part problems across chunks
- Each chunk row stores: `document_id`, `content`, `position`, `chunk_type_label`, `topic_label`

## Stage 3: Embedding and Metadata

**Input:** Chunks
**Output:** Vector embeddings stored in vector store; metadata stored in relational DB

- Each chunk → embedding vector (stored in ChromaDB / pgvector)
- In the current dev slice, embeddings default to a deterministic local hashing model and can be switched to `text-embedding-3-small` by setting `EMBEDDING_PROVIDER=openai`
- Each chunk also carries structured metadata:
  - Source document ID
  - Source type (slides, homework, exam, etc.)
  - Topic label
  - User-provided scope labels
  - Chunk type (problem, example, definition, etc.)
  - Position within source document
  - Parsing confidence indicator
- Chroma records use the PostgreSQL `chunk_id` as the vector-store ID so relational rows and vector entries stay aligned

> ⚠️ **Critical:** Metadata is not optional. Scope filtering (e.g., "Only Notes 3–8") must be enforceable through metadata, not just semantic similarity.

## Stage 4: Retrieval

**Input:** Query + task type + scope constraints
**Output:** Ranked relevant chunks

Retrieval is **task-conditioned** — different tasks use different retrieval strategies:

| Task | Retrieval Priority |
|---|---|
| Profile construction | Broad coverage across all materials |
| Practice generation | Topic-relevant instructional examples |
| Exam generation | Prior exams and assessment-like materials |
| Grading support | Adjacent examples, formulas, worked solutions |
| Targeted regeneration | Chunks linked to weak concepts |

Retrieval combines:
- Semantic similarity over embeddings
- Metadata filtering (scope, source type)
- Source-aware weighting (exams > homework > slides)
- Context-aware ranking based on downstream task

## Stage 5: Professor Profile Construction

**Input:** Retrieved evidence across all uploaded materials
**Output:** Versioned Professor Profile

Profile captures:
- **Topic distribution** — recurring topics and relative emphasis (soft weights, not rigid percentages)
- **Question type distribution** — MCQ, FRQ, calculation, proof, mixed
- **Difficulty tendencies** — estimated difficulty level
- **Exam structure** — section organization, question count patterns
- **Course character** — theoretical, computational, or mixed

Evidence weighting:
- Prior exams / practice tests → strongest signal
- Homework → topic emphasis and difficulty indicators
- Lecture slides → conceptual scope
- User-provided guidance → can override or clarify

> ⚠️ **Critical Rule:** Profile tendencies are **soft signals**. A topic that appears frequently should influence generation, but must not force mechanical proportional reproduction.

## Stage 6: Generation Pipeline (Multi-Stage) — Implemented

**Input:** Retrieved chunks + Profile + user config
**Output:** Practice set or simulated exam with answer key

> **Implementation:** `backend/services/generation/` — `GenerationService.run_pipeline()` orchestrates all 6 stages sequentially via `pipeline.py`. Prompt strings live in `prompts.py`. Internal models in `models.py`. See T-402.

Generation is **never a single LLM call**. The pipeline includes:

```
Draft Generation → Structure Validation → Novelty Checking → Difficulty Calibration → Answer Distribution Correction → Final Assembly
```

### Draft Generation
- Produce candidate questions from evidence + profile context
- Generate preliminary answer keys and explanations

### Structure Validation
- Check: question count, type mix, section organization, format completeness
- Reject/revise outputs that don't match requested format or profile structure

### Novelty Checking
- Compare generated questions against source chunks
- Detect near-duplicates, trivial numeric substitutions, shallow paraphrasing
- Compare against previously generated questions in same workspace

### Difficulty Calibration
- Estimate difficulty of generated questions
- Compare against profile tendencies and user's requested range
- Revise or replace miscalibrated questions

### Answer Distribution Correction (MCQ only)
- Check correct-answer position distribution across questions
- Verify distractor plausibility and consistency
- Shuffle or regenerate to eliminate bias patterns

### Final Assembly
- Order and group questions
- Attach answer keys and explanations
- Render final artifact (in-app view + optional PDF via Pandoc)

## Multi-Agent Formulation (Optional Architecture)

The quality-control stages may be implemented as specialized agents:

| Agent | Responsibility |
|---|---|
| Draft Generator Agent | Produce initial candidate questions |
| Structure Validator Agent | Check format and structural alignment |
| Novelty Checker Agent | Detect similarity to source material |
| Difficulty Calibration Agent | Verify difficulty alignment |
| Answer Distribution Agent | Correct MCQ position bias |
| Final Formatter Agent | Prepare output for delivery |

This formulation is optional for MVP — the stages can alternatively be implemented as sequential validation functions within the Generation Service. But the code structure must support future agent extraction.

## Stage 7: Grading Pipeline

**Input:** Student answers + generated questions + answer keys + retrieved context
**Output:** Structured grading results with error classifications

Grading produces:
- **Correctness label:** correct / partial / incorrect
- **Score value:** numeric or fractional
- **Diagnostic explanation:** structured reasoning about the error
- **Concept label:** which concept area the error implicates
- **Error classification:** specific failure type

Error categories:
- Wrong method selection
- Formula misuse
- Computational mistake
- Interpretation error
- Incomplete reasoning

> ⚠️ **Critical Rule:** Grading must NEVER collapse to a simple correct/incorrect binary. Structured error output is required for analytics.

## Stage 8: Analytics Loop

**Input:** Accumulated grading results across sessions
**Output:** Mastery estimates, error aggregations, trend metrics

Analytics tracks:
- Concept mastery scores (continuous or categorical)
- Error type frequency per concept
- Performance trends across sessions
- Improvement or decline signals

Analytics updates the `analytics_snapshots` table with serialized state after each grading cycle.

## Stage 9: Adaptive Regeneration

**Input:** Analytics snapshots + weakness signals
**Output:** Targeted generation request

Regeneration identifies:
- Concepts with consistently low mastery
- Topics with repeated error patterns
- Question types the student underperforms on
- Concepts not recently practiced

Regeneration feeds back into Stage 4 (Retrieval) with bias toward weak-area chunks, then continues through the normal generation pipeline.

```
Practice → Submit → Grade → Analyze → Identify Weaknesses → Regenerate → Practice (loop)
```

This loop is the core adaptive behavior of the system.
