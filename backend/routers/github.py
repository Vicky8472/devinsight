from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.github_service import fetch_github_data
from services.ai import analyze_github

router = APIRouter()


class GitHubRequest(BaseModel):
    username: str


@router.post("/github")
async def analyze_github_profile(body: GitHubRequest):
    # Accept full URLs like https://github.com/Vicky8472 or just usernames
    username = body.username.strip().rstrip("/")
    if "github.com/" in username:
        username = username.split("github.com/")[-1].split("/")[0]
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")

    try:
        data = await fetch_github_data(username)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch GitHub data: {e}")

    try:
        result = await analyze_github(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {e}")

    user = data["user"]
    result["username"] = username
    result["name"] = user.get("name") or username
    result["avatarUrl"] = user.get("avatar_url", "")
    result["bio"] = user.get("bio") or ""
    result["publicRepos"] = user.get("public_repos", 0)
    result["followers"] = user.get("followers", 0)
    result["languages"] = data["languages"]

    return result
