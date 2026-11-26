# Data Analytics Masters — Self-Contained LMS

A 100% browser-local, self-contained Data Analyst Learning Management System built with React, TypeScript, Vite, and Tailwind CSS. All lessons, embedded multi-table datasets, SQL & constrained Python sandboxes, assessments, portfolio templates, behavioral STAR practice, and career readiness workflows run locally in the browser with zero external links, zero backend servers, and automatic `localStorage` persistence.

## Curriculum & Modules (8 Ordered Modules, 40 Lessons)

1. **Module 1 (`mod-1`)**: Data Analytics Foundations & Business Thinking
2. **Module 2 (`mod-2`)**: Microsoft Excel & Spreadsheet Modeling
3. **Module 3 (`mod-3`)**: SQL for Data Analysis
4. **Module 4 (`mod-python`)**: Python for Data Analysis (pandas & NumPy)
5. **Module 5 (`mod-stats`)**: Practical Business Statistics & Experimental Reasoning
6. **Module 6 (`mod-4`)**: Data Visualization & BI Storytelling (Power BI & DAX)
7. **Module 7 (`mod-5`)**: Applied Business Case Studies & Portfolio Projects
8. **Module 8 (`mod-6`)**: Interview Preparation & Scenario-Based Mock Tests

## Interactive Sandboxes & Practice Features

- **4 Embedded Multi-Table Datasets** (`Operations`, `Retail Sales`, `Banking & Credit Cards`, `Human Resources`) with full schema inspection and CSV export.
- **In-Browser SQL Query Sandbox**: Supports `SELECT`, `JOIN`, `WHERE`, `GROUP BY`, `HAVING`, `CASE WHEN`, `WITH` CTEs, and Window Functions.
- **Constrained Python & pandas Simulator**: Browser-local analytical Python subset supporting `pd.read_csv()`, `.merge()`, `.groupby().agg()`, `.reset_index()`, boolean filtering, `.str.strip()` / `.str.lower()`, derived arithmetic columns, `.describe()`, `.value_counts()`, `np.mean`, `np.median`, `np.std`, `np.percentile`, and `print()`. Explicitly labeled as a constrained simulator rather than full CPython.
- **Open-Ended Evaluation System**: 8 analytical & debugging tasks across all 8 modules with deterministic verification, transparent 5-part weighted rubric (`40% / 25% / 15% / 10% / 10%`), draft persistence, hints, and reference solutions.
- **Timed Live-Coding Practice (`#/timed-practice`)**: Blank-editor SQL and Python timed drills (`15`, `30`, or `45` minutes) across Beginner, Intermediate, and Interview tiers with live countdown, 5-minute / 1-minute warnings, auto-submit on expiry, transparent score breakdown, and persisted attempt history.
- **Portfolio Artifact Builder (`#/portfolio`)**: Guided 5-step project workspace with 5 templates, 10-point quality validation, 8-dimension self-review rubric, and local Markdown `README.md` + plain-text case study exports.
- **Behavioral Interview Studio (`#/module/mod-6` / `#/behavioral-prep`)**: 12+ structured STAR/CAR prompts (including dynamic portfolio prompts), optional 2-minute timer, random prompt mode, 8-item self-review rubric, and saved answer history without fabricated experience claims.
- **Career Readiness & Application Tracker (`#/career-readiness`)**: Honest 1-page Resume Worksheet (`.txt` export), 15-item Application Readiness Checklist, local Job-Description Gap Analyzer mapped to internal LMS modules, and CRUD Application Tracker with CSV export.

## Hash Routes

- `#/dashboard` — Overview & 9-step sequence
- `#/modules` & `#/module/:moduleId` — Sequential modules & open-ended evaluations
- `#/lesson/:lessonId` — Self-contained lesson with inline simulator exercises
- `#/lab` & `#/lab/:labId` — Embedded datasets, SQL & Python sandboxes, guided challenges
- `#/timed-practice` & `#/timed-practice/:challengeId` — Blank-editor timed SQL/Python drills
- `#/portfolio` & `#/portfolio/:projectId` — Portfolio artifact workflow & Markdown/text exports
- `#/behavioral-prep` — Direct shortcut to Behavioral STAR Studio in Module 8 (`mod-6`)
- `#/career-readiness` — Resume worksheet, readiness checklist, JD gap analyzer, application tracker
- `#/quiz` & `#/quiz/:quizId` — 8 module quizzes + cumulative capstone assessment
- `#/progress` — Unified local mastery record

## Local Persistence

State is persisted under `localStorage` key `data_analytics_masters_lms_v3` with automatic migration from `data_analytics_masters_lms_v2` and full JSON export/import backup support inside **Settings**.

## Development & Build

```bash
npm install
npm run dev      # Starts Vite dev server on port 3000
npm run lint     # TypeScript type-check (tsc --noEmit)
npm run build    # Production build to dist/
```
