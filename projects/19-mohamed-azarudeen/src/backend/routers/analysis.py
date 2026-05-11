"""
Analysis Router
  POST /api/analysis/upload   — upload CSV, get session_id + metadata
  POST /api/analysis/run      — run NL query, get chart + code
"""

import asyncio
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from models.schemas import AnalysisRequest, AnalysisResult, DatasetMeta
from services import dataset_service, llm_service, sandbox_service
from core.config import settings

router = APIRouter()


@router.post("/upload", response_model=DatasetMeta)
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    raw = await file.read()
    size_mb = len(raw) / (1024 * 1024)
    if size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Max is {settings.MAX_FILE_SIZE_MB} MB.",
        )

    try:
        meta = dataset_service.create_session(raw, file.filename)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not parse CSV: {exc}")

    return meta


@router.post("/run", response_model=AnalysisResult)
async def run_analysis(req: AnalysisRequest):
    session = dataset_service.get_session(req.session_id)
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please upload a dataset first.",
        )

    df = session["df"]
    filename = session["filename"]
    raw_bytes = session["raw_bytes"]

    schema_summary = dataset_service.build_schema_summary(df)

    # LLM call (async)
    try:
        llm_response, code = await llm_service.generate_code(
            query=req.query,
            dataset_path=f"./{filename}",
            schema_summary=schema_summary,
            model=req.model,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM error: {exc}")

    # Sandbox execution (blocking — run in threadpool)
    try:
        sandbox_result = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: sandbox_service.run_in_sandbox(
                code=code,
                csv_bytes=raw_bytes,
                filename=filename,
                e2b_api_key=req.e2b_api_key,
            ),
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Sandbox error: {exc}")

    return AnalysisResult(
        session_id=req.session_id,
        query=req.query,
        model=req.model,
        llm_response=llm_response,
        extracted_code=code,
        chart_base64=sandbox_result["chart_base64"],
        stdout=sandbox_result["stdout"],
        error=sandbox_result["error"],
        execution_time_ms=sandbox_result["execution_time_ms"],
    )
