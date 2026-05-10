"""
Dataset Service: parses uploaded CSV, builds metadata and schema summary.
Keeps an in-memory session store (swap for Redis in production).
"""

import io
import uuid
from typing import Optional

import pandas as pd

from models.schemas import ColumnInfo, DatasetMeta
from core.config import settings

# Simple in-memory store: session_id -> {df, filename, raw_bytes}
_session_store: dict[str, dict] = {}


def create_session(csv_bytes: bytes, filename: str) -> DatasetMeta:
    """Parse CSV, store session, return metadata."""
    df = _normalize(pd.read_csv(io.BytesIO(csv_bytes)))
    session_id = str(uuid.uuid4())

    _session_store[session_id] = {
        "df": df,
        "filename": filename,
        "raw_bytes": csv_bytes,
    }

    column_info = [
        ColumnInfo(
            name=col,
            dtype=str(df[col].dtype),
            non_null_count=int(df[col].count()),
            sample_values=df[col].dropna().head(3).tolist(),
        )
        for col in df.columns
    ]

    return DatasetMeta(
        session_id=session_id,
        filename=filename,
        rows=len(df),
        columns=len(df.columns),
        column_info=column_info,
        preview=df.head(settings.MAX_ROWS_PREVIEW).to_dict(orient="records"),
    )


def get_session(session_id: str) -> Optional[dict]:
    return _session_store.get(session_id)


def build_schema_summary(df: pd.DataFrame) -> str:
    lines = [f"Shape: {df.shape[0]} rows × {df.shape[1]} columns", "Columns:"]
    for col in df.columns:
        sample = df[col].dropna().head(3).tolist()
        lines.append(f"  - {col} ({df[col].dtype}): sample={sample}")
    return "\n".join(lines)


def _normalize(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = (
        df.columns.str.strip()
        .str.lower()
        .str.replace(" ", "_", regex=False)
        .str.replace("-", "_", regex=False)
    )
    return df
