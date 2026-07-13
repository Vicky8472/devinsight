from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Any
from services.pdf_generator import generate_report

router = APIRouter()


class ReportRequest(BaseModel):
    github: dict[str, Any] | None = None
    resume: dict[str, Any] | None = None
    portfolio: dict[str, Any] | None = None


@router.post("/report")
async def download_report(body: ReportRequest):
    pdf_bytes = generate_report(body.model_dump())
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=devscope-report.pdf"},
    )
