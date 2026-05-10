"""
Sandbox Service: executes generated Python in an E2B sandbox.
Returns base64 PNG of any produced chart.
"""

import time
from e2b_code_interpreter import Sandbox
from core.config import settings


def run_in_sandbox(
    code: str,
    csv_bytes: bytes,
    filename: str,
    e2b_api_key: str,
) -> dict:
    """
    Uploads CSV to sandbox, executes code, returns:
      {chart_base64, stdout, error, execution_time_ms}
    """
    t0 = time.monotonic()

    with Sandbox(
        api_key=e2b_api_key,
        timeout=settings.SANDBOX_TIMEOUT_SECONDS,
    ) as sandbox:
        dataset_path = f"./{filename}"
        sandbox.files.write(dataset_path, csv_bytes)

        execution = sandbox.run_code(code)

    elapsed_ms = int((time.monotonic() - t0) * 1000)

    chart_b64 = None
    stdout_parts = []

    if not execution.error:
        for result in (execution.results or []):
            if hasattr(result, "png") and result.png:
                chart_b64 = result.png   # already base64
                break
            if hasattr(result, "text") and result.text:
                stdout_parts.append(str(result.text))

    return {
        "chart_base64": chart_b64,
        "stdout": "\n".join(stdout_parts) or None,
        "error": str(execution.error) if execution.error else None,
        "execution_time_ms": elapsed_ms,
    }
