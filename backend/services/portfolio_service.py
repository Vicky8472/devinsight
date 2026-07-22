import httpx
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; DevInsight/1.0; +https://github.com/devscope)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


def _extract(soup: BeautifulSoup) -> dict:
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    meta_desc = ""
    meta_tag = soup.find("meta", attrs={"name": "description"})
    if meta_tag and meta_tag.get("content"):
        meta_desc = str(meta_tag["content"]).strip()

    h1s = [h.get_text(strip=True) for h in soup.find_all("h1")]
    h2s = [h.get_text(strip=True) for h in soup.find_all("h2")]
    links = [a.get("href", "") for a in soup.find_all("a", href=True)]
    images = soup.find_all("img")
    imgs_no_alt = sum(1 for img in images if not img.get("alt"))
    nav = bool(soup.find("nav"))
    lang = soup.find("html").get("lang", "") if soup.find("html") else ""
    og_tags = {
        tag.get("property", "").replace("og:", ""): tag.get("content", "")
        for tag in soup.find_all("meta", property=True)
        if str(tag.get("property", "")).startswith("og:")
    }

    body_text = soup.get_text(separator=" ", strip=True)
    word_count = len(body_text.split())

    return {
        "title": title,
        "meta_description": meta_desc,
        "h1s": h1s[:5],
        "h2s": h2s[:8],
        "link_count": len(links),
        "image_count": len(images),
        "images_missing_alt": imgs_no_alt,
        "has_nav": nav,
        "html_lang": lang,
        "og_tags": og_tags,
        "word_count": word_count,
        "html_snippet": str(soup)[:5000],
    }


async def fetch_portfolio(url: str) -> dict:
    async with httpx.AsyncClient(
        headers=HEADERS,
        follow_redirects=True,
        timeout=15.0,
    ) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "")
        if "html" not in content_type:
            raise ValueError(f"URL returned non-HTML content: {content_type}")
        soup = BeautifulSoup(resp.text, "html.parser")
        data = _extract(soup)
        data["url"] = str(resp.url)
        data["status_code"] = resp.status_code
        return data
