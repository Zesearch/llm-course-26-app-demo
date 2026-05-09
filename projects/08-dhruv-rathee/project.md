## Project Title

CodeStory

## Short Description

CodeStory is an AI-powered git archaeology tool that explains why code exists by tracing blame, commit history, and GitHub context into a readable narrative.

## Problem

When developers inherit unfamiliar code, the hardest question is usually not what it does, but why it exists. `git blame` reveals who changed a line and when, but not the reasoning behind the change. That leaves onboarding, debugging, and maintenance dependent on tribal knowledge buried across commits, issues, and pull requests.

## Solution

CodeStory turns raw git history into a readable story. The system analyzes blame, commit history, and linked GitHub context, then uses Llama 3.2 to generate a narrative that explains a function’s origin, refactors, bug fixes, and current shape. An interactive timeline makes the evolution of the code easy to scan and share.

## User Flow

1. The user opens CodeStory on a confusing repository, file, or function.
2. The user enters the repo path, file path, and function name.
3. The backend traces the file history, gathers blame data, and pulls related GitHub context.
4. The LLM generates a narrative and timeline from the collected evidence.
5. The frontend displays the story, commit timeline, and linked issues or pull requests.
6. The user immediately understands what changed, why it changed, and who to ask next.

## LLM Components

The app uses Llama 3.2 to turn raw git history into a concise explanation. The **History Tracer** agent walks the commit history for the target file, the **Context Gatherer** agent collects related issues and pull requests, and the **Story Generator** agent produces the final narrative and timeline summary.

## Tools Used

- React
- Vite
- FastAPI
- PyGit2
- GitHub REST API
- Llama 3.2 via Ollama or Groq
- Python
- JavaScript
- HTML/CSS

