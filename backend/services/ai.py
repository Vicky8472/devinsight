"""
Provider-agnostic AI service. Configure via .env:

  Ollama (local, free forever):
    AI_BASE_URL=http://localhost:11434/v1
    AI_API_KEY=ollama
    AI_MODEL=llama3.2

  Groq (cloud free tier, open-source models):
    AI_BASE_URL=https://api.groq.com/openai/v1
    AI_API_KEY=gsk_your_key_here
    AI_MODEL=llama-3.3-70b-versatile

  OpenRouter (many free models):
    AI_BASE_URL=https://openrouter.ai/api/v1
    AI_API_KEY=sk-or-your_key_here
    AI_MODEL=meta-llama/llama-3.2-3b-instruct:free
"""

import os
import json
import re
from openai import AsyncOpenAI

_client: AsyncOpenAI | None = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            base_url=os.getenv("AI_BASE_URL", "http://localhost:11434/v1"),
            api_key=os.getenv("AI_API_KEY", "ollama"),
        )
    return _client


def _model() -> str:
    return os.getenv("AI_MODEL", "llama3.2")


def _parse_json(text: str) -> dict:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return json.loads(text.strip())


async def _ask(prompt: str) -> str:
    response = await get_client().chat.completions.create(
        model=_model(),
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content or ""


async def analyze_github(data: dict) -> dict:
    user = data["user"]
    top_repos = data["top_repos"]
    languages = data["languages"]

    repo_summaries = [
        {
            "name": r["name"],
            "description": r.get("description") or "No description",
            "language": r.get("language") or "Unknown",
            "stars": r.get("stargazers_count", 0),
            "topics": r.get("topics", []),
        }
        for r in top_repos
    ]

    prompt = f"""You are a senior developer career coach. Analyze this GitHub profile and return a JSON assessment.

Profile:
- Username: {user.get("login")}
- Name: {user.get("name") or "Not set"}
- Bio: {user.get("bio") or "Not set"}
- Location: {user.get("location") or "Not set"}
- Website: {user.get("blog") or "Not set"}
- Public repos: {user.get("public_repos", 0)}
- Followers: {user.get("followers", 0)}

Top Repositories:
{json.dumps(repo_summaries, indent=2)}

Language Distribution: {json.dumps(languages)}

Return ONLY valid JSON with this exact structure:
{{
  "overallScore": <integer 0-100>,
  "profileScore": <integer 0-100>,
  "repositoryScore": <integer 0-100>,
  "documentationScore": <integer 0-100>,
  "diversityScore": <integer 0-100>,
  "summary": "<2-3 sentence honest assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>", "<suggestion 4>", "<suggestion 5>"],
  "topRepos": [{{"name": "<repo>", "description": "<what it does>", "impact": "<why it helps>"}}]
}}"""

    return _parse_json(await _ask(prompt))


async def analyze_resume(text: str) -> dict:
    prompt = f"""You are an expert ATS resume reviewer. Analyze this resume and return a JSON assessment.

Resume:
{text[:6000]}

Return ONLY valid JSON with this exact structure:
{{
  "overallScore": <integer 0-100>,
  "atsScore": <integer 0-100>,
  "technicalScore": <integer 0-100>,
  "readabilityScore": <integer 0-100>,
  "grammarScore": <integer 0-100>,
  "summary": "<2-3 sentence assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>", "<improvement 4>", "<improvement 5>"],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"],
  "suggestions": [{{"section": "<section>", "before": "<original>", "after": "<improved>"}}]
}}"""

    return _parse_json(await _ask(prompt))


async def analyze_portfolio(html: str, url: str) -> dict:
    prompt = f"""You are a UX expert. Analyze this portfolio website and return a JSON assessment.

URL: {url}
HTML (truncated): {html[:5000]}

Return ONLY valid JSON with this exact structure:
{{
  "overallScore": <integer 0-100>,
  "uxScore": <integer 0-100>,
  "accessibilityScore": <integer 0-100>,
  "seoScore": <integer 0-100>,
  "contentScore": <integer 0-100>,
  "summary": "<2-3 sentence assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "issues": ["<issue 1>", "<issue 2>", "<issue 3>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>", "<suggestion 4>", "<suggestion 5>"]
}}"""

    return _parse_json(await _ask(prompt))
