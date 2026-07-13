from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import init_db

app = FastAPI(title="AI Career Analyzer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import resume, github, portfolio, auth, report

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(resume.router, prefix="/api/analyze", tags=["resume"])
app.include_router(github.router, prefix="/api/analyze", tags=["github"])
app.include_router(portfolio.router, prefix="/api/analyze", tags=["portfolio"])
app.include_router(report.router, prefix="/api", tags=["report"])


@app.on_event("startup")
def startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}
