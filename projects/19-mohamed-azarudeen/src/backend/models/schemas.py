from pydantic import BaseModel, Field
from typing import Optional, List, Any
from enum import Enum


class ModelChoice(str, Enum):
    llama31_8b = "llama3.1:8b"
    llama32 = "llama3.2:latest"
    deepseek_r1 = "deepseek-r1:7b"
    qwen25 = "qwen2.5:7b"
    mistral = "mistral:latest"
    qwen25_coder = "qwen2.5-coder:7b"
    


class AnalysisRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=1000)
    session_id: str = Field(..., description="Unique session ID tied to uploaded file")
    model: ModelChoice = ModelChoice.llama31_8b
    e2b_api_key: str = Field(..., min_length=1)

    class Config:
        use_enum_values = True


class ColumnInfo(BaseModel):
    name: str
    dtype: str
    non_null_count: int
    sample_values: List[Any]


class DatasetMeta(BaseModel):
    session_id: str
    filename: str
    rows: int
    columns: int
    column_info: List[ColumnInfo]
    preview: List[dict]


class AnalysisResult(BaseModel):
    session_id: str
    query: str
    model: str
    llm_response: str
    extracted_code: str
    chart_base64: Optional[str] = None   # PNG base64 if produced
    stdout: Optional[str] = None
    error: Optional[str] = None
    execution_time_ms: int = 0
