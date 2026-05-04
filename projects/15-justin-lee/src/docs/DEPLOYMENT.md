# Deployment Guide

## Overview

ExamProfile AI deploys cleanly as:

- Vercel for the Next.js frontend
- Render or Railway for the FastAPI backend
- Supabase for PostgreSQL, Auth, and optional file storage
- ChromaDB on persistent disk for development-scale vector storage

## Prerequisites

Before deploying, make sure you have:

- A Supabase project
- A Vercel account
- A Render account or Railway account
- A Google AI Studio API key for Gemini

## Step-by-Step Deployment Instructions

### 1. Clone the Repo

```bash
git clone <your-repo-url>
cd ExamReplica
```

### 2. Create the Supabase Project and Run Migrations

Create a Supabase project, then apply every migration in this order:

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

Run them either in the Supabase SQL Editor or through the Supabase CLI. The repository includes two `010_*` migrations; both must be applied after `009`.

### 3. Configure Supabase Auth

Enable email/password authentication in Supabase Auth.

For development and staging smoke tests:

- enable the email/password provider
- disable email confirmation if you want the smoke test to create or immediately use test accounts without inbox verification

### 4. Deploy the Backend to Render

Use [`backend/render.yaml`](../backend/render.yaml) as the reference deployment config.

Recommended setup:

1. Create a new Render web service from the repository
2. Keep the service root at the repository root so `uvicorn backend.main:app` resolves correctly
3. Use the environment variables documented in [`backend/.env.example`](../backend/.env.example)
4. Attach a persistent disk mounted at `/data`
5. Set `CHROMA_PERSIST_PATH=/data/chromadb`
6. Deploy and wait for the service to start
7. Verify `GET /api/health` on the deployed backend

### 5. Deploy the Frontend to Vercel

Use [`frontend/vercel.json`](../frontend/vercel.json) as the reference config.

Recommended setup:

1. Import the repository into Vercel
2. Set the project root to `frontend/`
3. Configure the frontend environment variables from [`frontend/.env.example`](../frontend/.env.example)
4. Set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend URL
5. Deploy and wait for the build to complete
6. Verify the login flow in the deployed app

### 6. Post-Deploy Verification

After both services are live:

1. Open the frontend
2. Sign up or log in with a test user
3. Upload at least one document to a workspace
4. Wait for indexing to finish
5. Run the smoke test script against the deployed backend

## Environment Variables Reference

| Variable | Service | Required | Where to get it |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Frontend | Yes | Backend deployment URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Yes | Supabase Project Settings -> API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Yes | Supabase Project Settings -> API |
| `SUPABASE_URL` | Backend | Yes | Supabase Project Settings -> API |
| `SUPABASE_ANON_KEY` | Backend | Yes | Supabase Project Settings -> API |
| `SUPABASE_SERVICE_KEY` | Backend | Yes | Supabase Project Settings -> API |
| `SUPABASE_JWT_SECRET` | Backend | Yes | Supabase Project Settings -> API -> JWT Settings |
| `SUPABASE_JWT_AUDIENCE` | Backend | No | Usually `authenticated` |
| `CORS_ALLOW_ORIGINS` | Backend | Yes | Comma-separated list of frontend origins |
| `STORAGE_BACKEND` | Backend | No | `local` for dev, `supabase` if using Supabase Storage |
| `LOCAL_STORAGE_ROOT` | Backend | No | Local writable path for uploads and exports |
| `SUPABASE_STORAGE_BUCKET` | Backend | No | Supabase Storage bucket name |
| `EMBEDDING_PROVIDER` | Backend | No | `local_hash` by default |
| `OPENAI_API_KEY` | Backend | No | OpenAI dashboard if using OpenAI embeddings |
| `OPENAI_EMBEDDING_MODEL` | Backend | No | OpenAI model name |
| `GEMINI_API_KEY` | Backend | Yes | Google AI Studio |
| `GEMINI_MODEL` | Backend | Yes | Gemini model name, for example `gemini-1.5-flash` |
| `GEMINI_API_BASE_URL` | Backend | No | Defaults to Google Generative Language API |
| `GEMINI_TIMEOUT_SECONDS` | Backend | No | Numeric timeout in seconds |
| `CHROMA_PERSIST_PATH` | Backend | Yes for persisted deploys | Writable local path or Render disk mount |
| `CHROMA_COLLECTION_NAME` | Backend | No | Chroma collection name |

## Troubleshooting

### CORS Errors

If the browser shows CORS failures, verify:

- the backend `CORS_ALLOW_ORIGINS` includes the exact Vercel origin
- multiple origins are comma-separated with no stray quotes unless you intentionally use JSON list syntax

### JWT Mismatch

If protected backend routes return `401` in staging:

- confirm `SUPABASE_JWT_SECRET` matches the active Supabase project
- confirm the frontend is pointed at the same Supabase project as the backend
- confirm the backend `SUPABASE_URL` and frontend `NEXT_PUBLIC_SUPABASE_URL` refer to the same project

### ChromaDB Path Problems

If indexing fails on Render:

- confirm the persistent disk is mounted
- confirm `CHROMA_PERSIST_PATH` points inside that mount, for example `/data/chromadb`
- confirm the service has permission to write to the directory

### Cold Starts on Render Free Tier

Render free-tier or low-tier services may cold start slowly. If the first generation or grading request times out:

- retry once after the service wakes up
- increase client-side poll timeouts for staging smoke tests
- consider moving to a paid plan for more stable background-task latency
