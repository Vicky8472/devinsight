# DevInsight

AI-powered career analyzer for developers. Get instant, actionable feedback on your resume, GitHub profile, and portfolio — no account needed until you want to download a report.

**Live app:** https://devinsight-gamma.vercel.app

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router, Framer Motion, Recharts
- **Backend:** FastAPI (Python), SQLite, JWT auth
- **AI:** Groq (OpenAI-compatible API)
- **Deployment:** Vercel (frontend), Render (backend)

## Features

- **GitHub Analyzer** — profile completeness, repository quality, documentation, language diversity
- **Resume Analyzer** — ATS scoring, keyword gaps, rewrite suggestions
- **Portfolio Analyzer** — UX, accessibility, SEO, and content review
- **Dashboard** — unified career score, skill radar, and priority actions across all three
- **PDF report** — downloadable summary, gated behind a free account

## Getting started

### Backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate   # or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env     # fill in AI_API_KEY, JWT_SECRET, etc.
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # set VITE_API_URL to your backend
npm run dev
```

## Repository

https://github.com/vignesh-krish-dev/devinsight
