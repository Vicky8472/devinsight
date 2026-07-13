import os
import httpx
from typing import Any

GITHUB_API = "https://api.github.com"


def _headers() -> dict[str, str]:
    headers = {"Accept": "application/vnd.github.v3+json"}
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


async def fetch_github_data(username: str) -> dict[str, Any]:
    async with httpx.AsyncClient(headers=_headers(), timeout=15) as client:
        user_res = await client.get(f"{GITHUB_API}/users/{username}")
        if user_res.status_code == 404:
            raise ValueError(f"GitHub user '{username}' not found")
        user_res.raise_for_status()
        user = user_res.json()

        repos_res = await client.get(
            f"{GITHUB_API}/users/{username}/repos",
            params={"sort": "updated", "per_page": 50, "type": "owner"},
        )
        repos_res.raise_for_status()
        repos = repos_res.json()

    languages: dict[str, int] = {}
    for repo in repos:
        lang = repo.get("language")
        if lang:
            languages[lang] = languages.get(lang, 0) + 1

    top_repos = sorted(repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)[:10]

    return {
        "user": user,
        "repos": repos,
        "top_repos": top_repos,
        "languages": languages,
    }
