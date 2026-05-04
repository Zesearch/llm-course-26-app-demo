# Requirements

## Product Purpose

ExamProfile AI **must** function as a course-specific exam simulation engine, not a generic AI tutor. Every feature must serve the core loop: upload materials → build a Professor Profile → generate practice/exams → grade submissions → surface weakness analytics → regenerate targeted practice.

## MVP Scope

The MVP **must** deliver:

1. User authentication and workspace management
2. Course material upload with labeling and scope annotations
3. Document parsing via Docling/Marker into normalized structured representations
4. Chunking, embedding, and metadata indexing of parsed content
5. Retrieval-augmented Professor Profile construction (topic emphasis, question types, difficulty tendencies, exam structure)
6. Practice problem generation and simulated exam generation
7. Multi-stage generation quality control (at minimum: draft + validation + assembly)
8. Answer submission and structured grading with error classification
9. Concept-level weakness analytics dashboard
10. Targeted practice regeneration driven by weakness signals

## Non-Goals (Out of Scope for MVP)

- Essay or subjective-response grading
- Live collaboration or multiplayer features
- Mobile-native apps
- Full microservice deployment
- Custom LLM fine-tuning
- Integration with external LMS platforms (Canvas, Blackboard)
- Gamification
- Social features
- Desktop client (web-first only for MVP)
- Support for non-STEM, non-structured subjects

## Architecture Constraints

- **Must** use a modular monolith architecture for MVP — no microservices
- **Must** separate frontend (React/TypeScript) and backend (FastAPI/Python) cleanly
- Backend **must** own all business logic, AI orchestration, and data access
- Frontend **must** be presentation and workflow control only — no business logic in the browser
- **Must** use Supabase (PostgreSQL + pgvector) as the primary relational store
- **Must** use ChromaDB for vector storage in development; Pinecone is optional for production
- **Must** use file/object storage for uploaded documents and generated artifacts

## AI Constraints

- Generation **must not** be a single one-shot LLM call — multi-stage quality control is required
- Generation **must** be grounded in retrieved course evidence — no pure hallucination
- Generated questions **must** aim for novelty — avoid shallow paraphrasing, trivial numeric substitution, or near-duplication of source materials
- MCQ generation **must** avoid repetitive answer-position bias and weak distractor construction
- Professor Profile tendencies **must** be treated as soft, evidence-weighted signals — not rigid deterministic percentages
- Stronger evidence sources (prior exams, practice tests, instructor guidance) **must** outweigh weaker signals (single homework problem, one slide)
- The system **must** use Gemini 1.5 Flash API as the primary LLM
- The system **must** use LlamaIndex for RAG orchestration

## Grading Constraints

- Grading **must not** be limited to correct/incorrect binary output
- Grading **must** produce structured error classifications (wrong method, formula misuse, computation error, interpretation error, incomplete reasoning)
- Grading **must** associate errors with concept areas for downstream analytics
- Partial correctness **should** be supported where feasible

## Analytics Constraints

- Analytics **must** aggregate grading signals longitudinally across sessions, not treat each session in isolation
- Concept mastery **must** be tracked and updated dynamically
- Error distributions **must** be aggregated by concept and error type
- Performance trends **must** be tracked across practice sessions
- Analytics **must** feed directly into targeted regeneration

## Data Constraints

- All structured application data **must** reside in the relational database (Supabase/PostgreSQL)
- Vector embeddings **must** reside in the vector store (ChromaDB / pgvector)
- Uploaded files and generated artifacts **must** reside in file/object storage
- Professor Profiles **must** support versioning
- Generated content, grading outputs, and analytics **must** be traceable back to their source workspace, materials, and submission context

## UX Constraints

- The application **must** be web-first
- All workflows **must** be accessible through a browser
- The interface **should** clearly show document processing status (uploaded, parsing, indexed, ready, failed)
- Generated exams **should** be viewable in-app and exportable as PDF
- The analytics dashboard **must** present concept mastery heatmaps, error-type distributions, performance timelines, and topic performance charts

## Implementation Constraints

- All TypeScript code **must** use strict mode
- All Python code **must** use type hints
- No fake production logic — stubs and mocks must be clearly labeled
- No hidden global state
- File organization **must** follow modular separation by service/feature
- Code **must** be production-minded, not hackathon-style
