from fastapi import APIRouter, UploadFile, File, HTTPException
from services.resume_parser import parse_pdf, parse_docx
from services.ai import analyze_resume

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@router.post("/resume")
async def analyze_resume_endpoint(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    file_bytes = await file.read()

    try:
        if file.content_type == "application/pdf":
            text = parse_pdf(file_bytes)
        else:
            text = parse_docx(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse file: {e}")

    if len(text.strip()) < 50:
        raise HTTPException(status_code=422, detail="File appears to be empty or unreadable")

    try:
        result = await analyze_resume(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {e}")

    result["filename"] = file.filename
    return result
