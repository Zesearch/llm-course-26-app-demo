# ResumeAlign AI

## Project Title

ResumeAlign AI

## Short Description

ResumeAlign AI is an AI powered resume tailoring tool that helps users compare their resume against a job description and improve it for better job alignment.

## Problem

Students and job seekers often apply to many roles without knowing how well their resume matches a specific job description. Manually checking for missing skills, weak bullet points, and ATS keywords takes time and can be confusing.

## Solution

ResumeAlign AI allows the user to upload a resume PDF and paste a job description. The app extracts resume text using pdfplumber, sends the resume and job description to an LLM through Groq, and returns a match score, missing keywords, rewritten resume bullets, and ATS improvement tips.

## User Flow

1. The user opens the web app.
2. The user uploads a resume PDF.
3. The user pastes the job description.
4. The user clicks `run analysis`.
5. The backend extracts text from the PDF.
6. The LLM compares the resume with the job description.
7. The frontend displays the match score, missing keywords, improved bullets, and ATS tips.

## LLM Components

The app uses Groq with the `llama-3.3-70b-versatile` model. The LLM analyzes the resume and job description together, identifies missing keywords, suggests where to add them, rewrites selected resume bullets, and gives ATS optimization tips.

## Tools Used

- React
- Vite
- FastAPI
- pdfplumber
- Groq
- Python
- JavaScript
- HTML/CSS

## Demo Video

https://drive.google.com/file/d/1h52WORI8zLxHwb6Rw54jFHCX5jR16AM5/view?usp=sharing

## Thumbnail Image

https://drive.google.com/file/d/1Ejv_9z0byccFM-wf4fMZDGreF8hPgQ2Z/view?usp=sharing
