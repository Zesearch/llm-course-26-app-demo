"""
LLM Service: calls local Ollama model and extracts Python code.
"""

import re
from ollama import AsyncClient
from core.config import settings

_code_pattern = re.compile(r"```python\n(.*?)\n```", re.DOTALL)
_fallback_pattern = re.compile(r"```\n(.*?)\n```", re.DOTALL)


def extract_code(text: str) -> str:
    """Pull the first Python code block from LLM output."""
    m = _code_pattern.search(text) or _fallback_pattern.search(text)
    return m.group(1).strip() if m else text.strip()


SYSTEM_PROMPT_TEMPLATE = """You are an expert Python data scientist and visualization engineer.
The dataset has already been loaded and saved at: '{dataset_path}'

Rules — follow strictly:
1. Always load the data with:
   df = pd.read_csv("{dataset_path}")
2. Immediately normalize column names:
   df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_").str.replace("-", "_")
3. Use pandas, matplotlib, or seaborn only (no plotly).
4. End every plotting script with:
   plt.tight_layout()
   plt.show()
5. Return ONLY valid Python inside a single ```python ... ``` block — no explanation outside it.
6. Do NOT use deprecated or unsupported keyword arguments.
7. If the question is analytical (not visual), print the result clearly.

Dataset schema for reference:
{schema}
"""


async def generate_code(
    query: str,
    dataset_path: str,
    schema_summary: str,
    model: str,
) -> tuple[str, str]:
    """
    Returns (llm_full_response, extracted_code).
    """
    client = AsyncClient(host=settings.OLLAMA_BASE_URL)

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT_TEMPLATE.format(
                dataset_path=dataset_path,
                schema=schema_summary,
            ),
        },
        {"role": "user", "content": query},
    ]

    response = await client.chat(model=model, messages=messages)
    llm_text: str = response["message"]["content"]
    code = extract_code(llm_text)
    return llm_text, code
