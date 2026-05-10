from tavily import TavilyClient
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import anthropic
import requests
import pymupdf
import os
import json
import concurrent.futures

load_dotenv()

app = FastAPI()

# Allow React frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY")
SCORECARD_KEY = os.getenv("COLLEGE_SCORECARD_API_KEY")
TAVILY_KEY = os.getenv("TAVILY_API_KEY")
tavily = TavilyClient(api_key=TAVILY_KEY)
def get_college_data(college_name: str):
    try:
        url = "https://api.data.gov/ed/collegescorecard/v1/schools"
        params = {
            "api_key": SCORECARD_KEY,
            "school.name": college_name,
            "fields": "school.name,latest.admissions.admission_rate.overall,latest.cost.tuition.out_of_state,latest.student.size",
            "_per_page": 10,
            "school.degrees_awarded.predominant": 3
        }
        res = requests.get(url, params=params)
        data = res.json()
        if data.get("results"):
            best = max(data["results"], key=lambda x: x.get("latest.student.size") or 0)
            admission_rate = best.get("latest.admissions.admission_rate.overall")
            tuition = best.get("latest.cost.tuition.out_of_state")
            size = best.get("latest.student.size")
            return {
                "name": best.get("school.name"),
                "admission_rate": f"{round(admission_rate * 100)}%" if admission_rate else "N/A",
                "tuition": f"${tuition:,}" if tuition else "N/A",
                "size": f"{size:,} students" if size else "N/A"
            }
    except Exception as e:
        print(f"College data error: {e}")
    return {"admission_rate": "N/A", "tuition": "N/A", "size": "N/A"}




client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

# ── Models ──
class ChatMessage(BaseModel):
    message: str
    history: list

class AnalyzeRequest(BaseModel):
    profile: str

# ── Routes ──
@app.get("/")
def root():
    return {"status": "GetIn.School backend running!"}

@app.post("/chat")
def chat(data: ChatMessage):
    messages = data.history + [{"role": "user", "content": data.message}]
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system="""You are an expert college admissions counselor. 
        Ask students about their GPA, major, dream college, and achievements 
        one question at a time. Be friendly and encouraging.
        When you have enough info add [READY] at the end of your message.""",
        messages=messages
    )
    return {"reply": response.content[0].text}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    contents = await file.read()
    doc = pymupdf.open(stream=contents, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return {"text": text}

@app.post("/analyze")
def analyze(data: AnalyzeRequest):
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        messages=[{
            "role": "user",
            "content": f"""Analyze this student profile and IMPORTANT: Return ONLY the raw JSON object. No explanation, no markdown, no backticks. Start your response with {{ and end with }}
            
{data.profile}

Return this exact JSON structure:
{{
  "profileScore": <0-100>,
  "profileSummary": "<2 sentence summary>",
"colleges": [
    {{"name": "Main university name only e.g. New York University not NYU Stern", "type": "reach", "match": "<why>"}},
    {{"name": "Main university name only e.g. University of Michigan not Ross School of Business", "type": "reach", "match": "<why>"}},
    {{"name": "Main university name only e.g. Johns Hopkins University not Bloomberg School", "type": "reach", "match": "<why>"}},
    {{"name": "Main university name only", "type": "match", "match": "<why>"}},
    {{"name": "Main university name only", "type": "match", "match": "<why>"}},
    {{"name": "Main university name only", "type": "match", "match": "<why>"}},
    {{"name": "Main university name only", "type": "safety", "match": "<why>"}},
    {{"name": "Main university name only", "type": "safety", "match": "<why>"}},
    {{"name": "Main university name only", "type": "safety", "match": "<why>"}}
  ],
  "gaps": [
    {{"factor": "GPA", "score": <0-100>, "advice": "..."}},
    {{"factor": "Test Scores", "score": <0-100>, "advice": "..."}},
    {{"factor": "Research", "score": <0-100>, "advice": "..."}},
    {{"factor": "Leadership", "score": <0-100>, "advice": "..."}},
    {{"factor": "Projects", "score": <0-100>, "advice": "..."}},
    {{"factor": "Essays", "score": <0-100>, "advice": "..."}}
  ],
  "roadmap": [
    {{"phase": "Right Now", "emoji": "🚀", "title": "...", "tasks": "..."}},
    {{"phase": "3 Months", "emoji": "📚", "title": "...", "tasks": "..."}},
    {{"phase": "6 Months", "emoji": "🏆", "title": "...", "tasks": "..."}},
    {{"phase": "Before Apply", "emoji": "✅", "title": "...", "tasks": "..."}}
  ],
  "essay": "<3 paragraph personal statement as single string with \\n\\n between paragraphs>",
  "activities": [
    {{"emoji": "🔬", "title": "...", "why": "...", "impact": "..."}},
    {{"emoji": "💡", "title": "...", "why": "...", "impact": "..."}},
    {{"emoji": "🌍", "title": "...", "why": "...", "impact": "..."}},
    {{"emoji": "📣", "title": "...", "why": "...", "impact": "..."}}
  ]
}}"""
        }]
    )
    # Parse the response
    raw = response.content[0].text.replace("```json", "").replace("```", "").strip()
    start = raw.index("{")
    end = raw.rindex("}") + 1
    result = json.loads(raw[start:end])

    # Enrich colleges with real data in PARALLEL
    def enrich_college(college):
        real_data = get_college_data(college["name"])
        college["admission_rate"] = real_data["admission_rate"]
        college["tuition"] = real_data["tuition"]
        college["size"] = real_data["size"]
        return college

    with concurrent.futures.ThreadPoolExecutor(max_workers=9) as executor:
        enriched = list(executor.map(enrich_college, result.get("colleges", [])))
    result["colleges"] = enriched

    return {"result": json.dumps(result)}





    
    
@app.get("/college-data")
def college_data(name: str):
    return get_college_data(name)
class CollegeSearchRequest(BaseModel):
    query: str

@app.post("/search-college")
def search_college(data: CollegeSearchRequest):
    college_data = get_college_data(data.query)
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"""For {data.query}, provide a brief JSON response:
{{
  "known_for": "<2-3 things the college is known for>",
  "best_programs": ["program1", "program2", "program3"],
  "campus_vibe": "<one sentence about campus culture>",
  "notable_alumni": "<2 famous alumni>",
  "ranking": "<rough national ranking>"
}}
Return ONLY valid JSON, nothing else."""
        }]
    )
    
    raw = response.content[0].text.replace("```json", "").replace("```", "").strip()
    start = raw.index("{")
    end = raw.rindex("}") + 1
    try:
        ai_context = json.loads(raw[start:end])
    except:
        ai_context = {}
    
    return {
        "name": college_data.get("name", data.query),
        "admission_rate": college_data.get("admission_rate", "N/A"),
        "tuition": college_data.get("tuition", "N/A"),
        "size": college_data.get("size", "N/A"),
        **ai_context
    }
class ScholarshipRequest(BaseModel):
    profile: str

@app.post("/scholarships")
def find_scholarships(data: ScholarshipRequest):
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": f"""Based on this student profile, suggest 6 real scholarships they should apply for. 
Important: Use 2025 or 2026 deadlines only, not past dates.

{data.profile}

Return ONLY valid JSON:
{{
  "scholarships": [
    {{
      "name": "scholarship name",
      "amount": "$X,XXX",
      "deadline": "Month 2025 or 2026",
      "eligibility": "who qualifies",
      "description": "one sentence about it",
      "apply_url": "https://real-url.org",
      "match_reason": "why this student qualifies"
    }}
  ]
}}"""
        }]
    )
    raw = response.content[0].text.replace("```json", "").replace("```", "").strip()
    start = raw.index("{")
    end = raw.rindex("}") + 1
    return json.loads(raw[start:end])

class RedditRequest(BaseModel):
    college: str
    program: str

@app.post("/reddit-reviews")
def reddit_reviews(data: RedditRequest):
    results = tavily.search(
        query=f"{data.college} {data.program} reddit review student experience",
        search_depth="basic",
        max_results=5,
        include_domains=["reddit.com"]
    )
    
    content = "\n".join([r.get("content", "") for r in results.get("results", [])])
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"""Based on these Reddit posts about {data.college} {data.program}:

{content}

Return ONLY valid JSON:
{{
  "overall_sentiment": "positive/mixed/negative",
  "rating": <1-5>,
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2", "con3"],
  "summary": "<2 sentence overall summary of student experiences>"
}}"""
        }]
    )
    
    raw = response.content[0].text.replace("```json", "").replace("```", "").strip()
    start = raw.index("{")
    end = raw.rindex("}") + 1
    return json.loads(raw[start:end])
class ProfessorRequest(BaseModel):
    college: str
    department: str

@app.post("/professors")
def find_professors(data: ProfessorRequest):
    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": f"""List 6 real professors at {data.college} who work in {data.department}.

You must respond with ONLY this JSON structure, nothing else:
{{
  "professors": [
    {{
      "name": "Professor Name",
      "title": "Professor",
      "affiliations": ["{data.college}"],
      "research_interests": "research area",
      "recent_papers": ["paper 1", "paper 2"],
      "h_index": 20,
      "citation_count": 5000,
      "paper_count": 50,
      "profile_url": "https://scholar.google.com/scholar?q=PROFESSOR_NAME+COLLEGE_NAME (use actual professor name and college, replace spaces with +)"
    }}
  ]
}}"""
            }]
        )
        
        raw = response.content[0].text.strip()
        # Try to find JSON in response
        if "{" in raw and "}" in raw:
            start = raw.index("{")
            end = raw.rindex("}") + 1
            return json.loads(raw[start:end])
        else:
            return {"professors": []}
    except Exception as e:
        print(f"Professor error: {e}")
        return {"professors": []}