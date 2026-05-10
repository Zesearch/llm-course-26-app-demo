---

slug: getin-school title: "GetIn.School — AI-Powered College Admissions Counselor" students:

- Sai Ruthvik Madireddy tags:  
- education  
- college-admissions  
- rag  
- full-stack category: other tagline: "Your personal AI college counselor — get a full admissions strategy in 60 seconds." featuredEligible: true semester: Spring 2026 shortTitle: GetIn.School studentId: "116643502" videoUrl: [Videolink](https://drive.google.com/file/d/1VyOZuEDvtEMV66TF2PoZ4nwExBW79eUe/view?usp=drive_link) PASTE\_YOUR\_VIDEO\_LINK\_HERE thumbnail: [thumbnail](https://drive.google.com/file/d/1jYtSl9DKkjAt2iMAa3c6EQB-Ncg-pq8Y/view?usp=drive_link)  
- PASTE\_YOUR\_THUMBNAIL\_LINK\_HERE githubUrl: [https://github.com/sruthvik/getin-school](https://github.com/sruthvik/getin-school)

---

## Problem

Millions of students apply to college with zero personalized guidance. Professional counselors charge $200–500/hr — most students cannot afford this. First-generation and international students are completely on their own, making uninformed decisions that can cost them their dream school.

## Solution

GetIn.School is a full-stack AI college counselor that fits in your pocket and costs nothing. Students either chat naturally with an AI advisor or upload their resume to instantly receive a complete, personalized college application strategy — including a college list with real acceptance rates, gap analysis, step-by-step roadmap, AI-drafted personal statement, scholarship finder, Reddit reviews, and professor search.

## User Flow

1. Student signs up and logs in with their account  
2. Chooses Chat mode (conversational AI advisor) or Form mode (structured input)  
3. Uploads PDF resume — system automatically extracts GPA, achievements, and experience  
4. AI advisor collects profile through natural conversation (major, dream college, achievements)  
5. Clicks "Generate My Full Analysis" — system calls Claude API and fetches real college data in parallel  
6. Full dashboard loads with: personalized college list (reach/match/safety), gap analysis scores, roadmap, essay draft, and activity recommendations  
7. Student clicks "Find My Scholarships" for personalized scholarship matches  
8. Student clicks "Reddit Reviews" on any college for real student sentiment  
9. Student uses College Explorer to research any school with real stats  
10. Student uses Professor Search to find faculty at target schools for outreach  
11. All analyses saved to Supabase — accessible anytime via History tab

## LLM Components

- **Conversational AI Advisor** — Claude Sonnet 4 conducts a natural multi-turn conversation to collect student profile data, asking about GPA, major, dream college, and achievements one question at a time  
- **Profile Analysis Engine** — Claude evaluates 6 factors (GPA, test scores, research, leadership, projects, essays) and generates a structured JSON response with profile score, college matches, gap analysis, roadmap, personal statement, and activity recommendations  
- **College Explorer Context** — Claude enriches College Scorecard API data with campus vibe, known programs, rankings, and notable alumni for any searched university  
- **Scholarship Matching** — Claude suggests real scholarships the student qualifies for based on their profile, major, and achievements  
- **Professor Search** — Claude identifies real faculty at target universities by department and research area, with paper titles and Google Scholar links  
- **Reddit Sentiment Analysis** — Claude summarizes Reddit posts fetched via Tavily API into structured pros, cons, ratings, and sentiment for each college

## Tools

- **Frontend:** React, Vite, Tailwind CSS  
- **Backend:** Python, FastAPI, Uvicorn  
- **LLM:** Claude Sonnet 4 (Anthropic API)  
- **Database & Auth:** Supabase (PostgreSQL)  
- **Data APIs:** US College Scorecard API (official government data), Tavily API (Reddit search), Semantic Scholar API  
- **Document Processing:** PyMuPDF (PDF resume parsing)  
- **Performance:** concurrent.futures ThreadPoolExecutor (parallel API calls — 50% latency reduction)  
- **Deployment:** Vercel (frontend), Railway (backend)  
- **Vibe Coding:** Claude AI used throughout development  
- **Version Control:** Git, GitHub

