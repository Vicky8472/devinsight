import os
import json
import re
from google import genai

_client: genai.Client | None = None


def get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))
    return _client


def _parse_json(text: str) -> dict:
    text = text.strip()
    # Strip markdown code fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return json.loads(text.strip())


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
            "forks": r.get("forks_count", 0),
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
- Company: {user.get("company") or "Not set"}
- Public repos: {user.get("public_repos", 0)}
- Followers: {user.get("followers", 0)}

Top Repositories:
{json.dumps(repo_summaries, indent=2)}

Language Distribution: {json.dumps(languages)}

Return ONLY valid JSON matching this structure exactly:
{{
  "overallScore": <integer 0-100>,
  "profileScore": <integer 0-100>,
  "repositoryScore": <integer 0-100>,
  "documentationScore": <integer 0-100>,
  "diversityScore": <integer 0-100>,
  "summary": "<2-3 sentence honest assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "suggestions": [
    "<specific actionable suggestion 1>",
    "<specific actionable suggestion 2>",
    "<specific actionable suggestion 3>",
    "<specific actionable suggestion 4>",
    "<specific actionable suggestion 5>"
  ],
  "topRepos": [
    {{"name": "<repo name>", "description": "<what it does>", "impact": "<why it helps your profile>"}}
  ]
}}

Score honestly. Penalise missing bios, no descriptions on repos, lack of README, and low diversity."""

    response = await get_client().aio.models.generate_content(
        model="gemini-pro",
        contents=prompt,
    )
    return _parse_json(response.text)


async def analyze_resume(text: str) -> dict:
    prompt = f"""You are an expert ATS resume reviewer and career coach. Analyze this resume text and return a JSON assessment.

Resume Text:
{text[:6000]}

Return ONLY valid JSON matching this structure exactly:
{{
  "overallScore": <integer 0-100>,
  "atsScore": <integer 0-100>,
  "technicalScore": <integer 0-100>,
  "readabilityScore": <integer 0-100>,
  "grammarScore": <integer 0-100>,
  "summary": "<2-3 sentence honest assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": [
    "<specific improvement 1>",
    "<specific improvement 2>",
    "<specific improvement 3>",
    "<specific improvement 4>",
    "<specific improvement 5>"
  ],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"],
  "suggestions": [
    {{"section": "<section name>", "before": "<original text example>", "after": "<improved version>"}}
  ]
}}"""

    response = await get_client().aio.models.generate_content(
        model="gemini-pro",
        contents=prompt,
    )
    return _parse_json(response.text)


async def analyze_portfolio(html: str, url: str) -> dict:
    prompt = f"""You are a UX expert and web developer. Analyze this portfolio website and return a JSON assessment.

URL: {url}

Page HTML (truncated):
{html[:6000]}

Return ONLY valid JSON matching this structure exactly:
{{
  "overallScore": <integer 0-100>,
  "uxScore": <integer 0-100>,
  "accessibilityScore": <integer 0-100>,
  "seoScore": <integer 0-100>,
  "contentScore": <integer 0-100>,
  "summary": "<2-3 sentence honest assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "issues": [
    "<specific issue 1>",
    "<specific issue 2>",
    "<specific issue 3>"
  ],
  "suggestions": [
    "<specific actionable suggestion 1>",
    "<specific actionable suggestion 2>",
    "<specific actionable suggestion 3>",
    "<specific actionable suggestion 4>",
    "<specific actionable suggestion 5>"
  ]
}}"""

    response = await get_client().aio.models.generate_content(
        model="gemini-pro",
        contents=prompt,
    )
    return _parse_json(response.text)
