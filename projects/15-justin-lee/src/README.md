# ExamProfile AI

A STEM-focused, web-first exam simulation and weakness analytics platform.

ExamProfile AI ingests course materials to build a **Professor Profile** of instructor assessment tendencies, then generates course-specific practice problems and simulated exams with multi-stage quality control. Students receive diagnostically structured grading and concept-level weakness analytics that drive adaptive targeted practice.

## Repository Structure

```text
ExamReplica/
├── AI_CONTEXT.md
├── README.md
├── backend/
│   ├── config/
│   ├── main.py
│   ├── requirements.txt
│   ├── routes/
│   ├── scripts/
│   └── services/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CODING_RULES.md
│   ├── DB_SCHEMA.md
│   ├── DEPLOYMENT.md
│   ├── IMPLEMENTATION_PHASES.md
│   ├── REQUIREMENTS.md
│   └── TASKS.md
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── vercel.json
└── migrations/
```

## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.10+ with Python 3.11 recommended for parity with the backend toolchain
- A Supabase project
- A Google AI Studio API key for Gemini

### Frontend Local Dev

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

### Backend Local Dev

Run the backend from the repository root so `backend.main:app` resolves cleanly:

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
export PYTHONPATH=.
uvicorn backend.main:app --reload
```

The backend runs at `http://localhost:8000`. Interactive API docs are available at `http://localhost:8000/docs`.

### Environment Variables

- Frontend variables live in [`frontend/.env.example`](frontend/.env.example)
- Backend variables live in [`backend/.env.example`](backend/.env.example)

Copy each example file to a local `.env` file and fill in the real values before running the app.

## Running Supabase Migrations

All SQL files in [`migrations/`](migrations/) must be applied to your Supabase project before the full app will work.

Apply the migrations in this order:

1. `001_users_workspaces.sql`
2. `002_documents.sql`
3. `003_rls_policies.sql`
4. `004_parsing_tables.sql`
5. `005_chunks_table.sql`
6. `006_embeddings_tracking.sql`
7. `007_professor_profiles.sql`
8. `008_generation_tables.sql`
9. `009_submission_grading_tables.sql`
10. `010_fix_grading_schema.sql`
11. `010_generated_questions_options.sql`
12. `011_generated_questions_points_possible.sql`
13. `012_analytics_regeneration_tables.sql`
14. `013_phase7_rls_audit.sql`

You can run them either way:

- Supabase SQL Editor: paste each file in order and execute it against the target project
- Supabase CLI: use `supabase db push` or execute the files manually in order against the remote database

The repository currently includes two `010_*` migrations. Apply both after `009_submission_grading_tables.sql`, in the order listed above.

## Running Tests

### Backend

```bash
cd /path/to/ExamReplica
backend/.venv/bin/pytest backend/tests/ -v
```

### Frontend

```bash
cd frontend
npm test
```

## Deployment

### Frontend

Deploy the Next.js app to Vercel using [`frontend/vercel.json`](frontend/vercel.json). Set:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Set the Vercel project root to `frontend/`.

### Backend

Deploy the FastAPI app to Render with [`backend/render.yaml`](backend/render.yaml) or mirror the same settings in Railway. Set the backend environment variables from [`backend/.env.example`](backend/.env.example), and mount persistent storage for ChromaDB if you are using Render.

### Database

Supabase hosts the relational database and Auth. After creating the project, run every migration in [`migrations/`](migrations/) before using the deployed application.

### ChromaDB Note

For Render, mount a persistent disk and set `CHROMA_PERSIST_PATH=/data/chromadb`. For production scale, consider moving vector storage to pgvector in Supabase or Pinecone instead of relying on local disk persistence.

## Documentation

Core project documentation lives in [`docs/`](docs/):

1. [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md)
2. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
3. [`docs/IMPLEMENTATION_PHASES.md`](docs/IMPLEMENTATION_PHASES.md)
4. [`docs/TASKS.md`](docs/TASKS.md)
5. [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

The full technical specification lives in [`Specifications/ExamReplica_AI_Specs.tex`](Specifications/ExamReplica_AI_Specs.tex).
