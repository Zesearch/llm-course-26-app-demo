# ExamProfile AI

## What It Is

ExamProfile AI is a **STEM-focused, web-first exam simulation and weakness analytics platform**. It ingests real course materials — lecture slides, homework sets, prior exams, practice tests, and optional instructor guidance — to build a structured **Professor Profile** of instructor assessment tendencies.

Using this profile and a retrieval-augmented generation (RAG) pipeline, the system produces **course-specific** practice problems, simulated exams, answer keys, and explanations. Students submit answers and receive **diagnostically structured grading**, concept-level weakness analytics, and **adaptive targeted practice regeneration**.

## Who It Is For

Students in **quantitative STEM courses** — statistics, calculus, linear algebra, physics, engineering, computer science — where exams follow structured, analyzable patterns.

## What Makes It Different

| Differentiator | Description |
|---|---|
| Professor Profile modeling | Evidence-weighted model of instructor tendencies, not a generic question bank |
| Distribution-aware generation | Topic emphasis, question types, difficulty calibrated to course evidence |
| Multi-stage quality-controlled generation | Draft → Validate → Novelty Check → Difficulty Calibration → Answer Distribution → Assembly |
| Structured diagnostic grading | Error classification (wrong method, formula misuse, computation error, interpretation error) |
| Concept-level weakness analytics | Mastery tracking, error aggregation, trend visualization |
| Adaptive regeneration | Targeted follow-up practice driven by demonstrated weaknesses |

## What It Is Not

- Not a generic AI chatbot or tutor
- Not a homework helper
- Not a replacement for instruction
- Not an essay-grading or subjective-response platform

## MVP Goal

Deliver a working end-to-end loop: **upload → profile → generate → submit → grade → analyze → regenerate** for a single STEM course workspace.
