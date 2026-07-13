from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.portfolio_service import fetch_portfolio
from services.ai import analyze_portfolio

router = APIRouter()


class PortfolioRequest(BaseModel):
    url: str


@router.post("/portfolio")
async def analyze_portfolio_endpoint(body: PortfolioRequest):
    url = body.url.strip()
    if not url.startswith("http"):
        url = "https://" + url

    try:
        page_data = await fetch_portfolio(url)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not fetch URL: {e}")

    try:
        result = await analyze_portfolio(page_data["html_snippet"], page_data["url"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {e}")

    result["url"] = page_data["url"]
    result["meta"] = {
        "title": page_data["title"],
        "word_count": page_data["word_count"],
        "image_count": page_data["image_count"],
        "images_missing_alt": page_data["images_missing_alt"],
        "has_nav": page_data["has_nav"],
        "html_lang": page_data["html_lang"],
        "og_tags": page_data["og_tags"],
        "link_count": page_data["link_count"],
    }
    return result
