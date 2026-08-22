from fpdf import FPDF
from datetime import datetime

PAGE_W = 210
PAGE_H = 297
MARGIN = 16
CONTENT_W = PAGE_W - 2 * MARGIN

# Colour palette (RGB) — matches the app's dark violet theme
C_BG = (10, 14, 26)          # near-black page background
C_CARD = (23, 29, 46)        # card fill
C_BORDER = (40, 48, 68)      # card border
C_ACCENT = (139, 92, 246)    # violet-500
C_GREEN = (52, 211, 153)     # emerald-400
C_BLUE = (96, 165, 250)      # blue-400
C_YELLOW = (251, 191, 36)    # amber-400
C_RED = (248, 113, 113)      # red-400
C_WHITE = (241, 245, 249)
C_MUTED = (148, 163, 184)    # slate-400
C_FAINT = (71, 85, 105)      # slate-600

# Common Unicode punctuation Groq's output tends to use, mapped to latin-1-safe equivalents.
_CHAR_MAP = {
    "—": "-", "–": "-", "‘": "'", "’": "'",
    "“": '"', "”": '"', "•": "*", "…": "...",
    "→": "->", "‑": "-", " ": " ",
}


def _safe(text) -> str:
    """Normalize Groq's Unicode output into something Helvetica (latin-1) can render."""
    if text is None:
        return ""
    text = str(text)
    for src, dst in _CHAR_MAP.items():
        text = text.replace(src, dst)
    return text.encode("latin-1", errors="replace").decode("latin-1")


def _score_color(s: int) -> tuple[int, int, int]:
    if s >= 75:
        return C_GREEN
    if s >= 50:
        return C_BLUE
    if s >= 25:
        return C_YELLOW
    return C_RED


def _score_label(s: int) -> str:
    if s >= 80:
        return "Elite Developer Profile"
    if s >= 65:
        return "Strong Developer Profile"
    if s >= 50:
        return "Developing Profile"
    if s >= 35:
        return "Emerging Developer"
    return "Profile Needs Attention"


class DevInsightPDF(FPDF):
    """Every page (manual or auto-inserted by page-break) gets the same dark
    background and header/footer chrome, so pages never mismatch."""

    def header(self):
        self.set_fill_color(*C_BG)
        self.rect(0, 0, PAGE_W, PAGE_H, style="F")

        self.set_font("Helvetica", "B", 14)
        self.set_text_color(*C_ACCENT)
        self.set_xy(MARGIN, 12)
        self.cell(60, 8, "DevInsight", ln=False)

        self.set_font("Helvetica", "", 9)
        self.set_text_color(*C_MUTED)
        self.set_xy(0, 14)
        self.cell(PAGE_W - MARGIN, 6, datetime.now().strftime("%B %d, %Y"), align="R")

        self.set_draw_color(*C_BORDER)
        self.set_line_width(0.3)
        self.line(MARGIN, 24, PAGE_W - MARGIN, 24)
        self.set_y(32)

    def footer(self):
        self.set_y(-14)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*C_FAINT)
        self.cell(0, 8, f"Page {self.page_no()} - DevInsight AI Career Report", align="C")

    def section_title(self, text: str, color: tuple[int, int, int] = C_ACCENT):
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(*color)
        self.set_x(MARGIN)
        self.cell(0, 9, _safe(text), ln=True)
        y = self.get_y() + 1
        self.set_draw_color(*color)
        self.set_line_width(0.6)
        self.line(MARGIN, y, PAGE_W - MARGIN, y)
        self.set_y(y + 5)

    def score_row(self, scores: list[tuple[str, int]]):
        """Evenly-spaced score cards across the content width, fixed height."""
        n = len(scores)
        gap = 4
        w = (CONTENT_W - gap * (n - 1)) / n
        h = 24
        x = MARGIN
        y = self.get_y()
        for label, score in scores:
            color = _score_color(score)
            self.set_fill_color(*C_CARD)
            self.set_draw_color(*C_BORDER)
            self.rect(x, y, w, h, style="FD")
            self.set_font("Helvetica", "B", 17)
            self.set_text_color(*color)
            self.set_xy(x, y + 4)
            self.cell(w, 9, str(score), align="C")
            self.set_font("Helvetica", "", 7.5)
            self.set_text_color(*C_MUTED)
            self.set_xy(x, y + 15)
            self.cell(w, 6, _safe(label), align="C")
            x += w + gap
        self.set_y(y + h + 6)

    def paragraph(self, text: str, italic: bool = True, color=C_MUTED):
        self.set_font("Helvetica", "I" if italic else "", 9.5)
        self.set_text_color(*color)
        self.set_x(MARGIN)
        self.multi_cell(CONTENT_W, 5.5, _safe(text))
        self.ln(3)

    def bullet_heading(self, text: str, color: tuple[int, int, int]):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*color)
        self.set_x(MARGIN)
        self.cell(0, 6, _safe(text), ln=True)
        self.ln(1)

    def bullet_list(self, items: list[str], marker: str = "-", text_color=C_WHITE):
        for item in items:
            self.set_font("Helvetica", "B", 9.5)
            self.set_text_color(*C_ACCENT)
            self.set_x(MARGIN + 2)
            marker_w = 5
            self.cell(marker_w, 5.5, _safe(marker))
            self.set_font("Helvetica", "", 9.5)
            self.set_text_color(*text_color)
            self.set_x(MARGIN + 2 + marker_w)
            self.multi_cell(CONTENT_W - 2 - marker_w, 5.5, _safe(item))
            self.ln(0.5)
        self.ln(3)


def _module_section(pdf: DevInsightPDF, title: str, accent, scores: list[tuple[str, int]],
                     summary: str | None, strengths: list[str] | None,
                     improvements: list[str] | None, improvements_label: str = "Improvements",
                     extra_line: str | None = None):
    # Keep a section's heading glued to at least its score row; break early if tight on room.
    if pdf.get_y() > PAGE_H - 90:
        pdf.add_page()

    pdf.section_title(title, accent)

    if extra_line:
        pdf.set_font("Helvetica", "", 8.5)
        pdf.set_text_color(*C_MUTED)
        pdf.set_x(MARGIN)
        pdf.multi_cell(CONTENT_W, 5, _safe(extra_line))
        pdf.ln(2)

    pdf.score_row(scores)

    if summary:
        pdf.paragraph(summary)

    if strengths:
        pdf.bullet_heading("Strengths", C_GREEN)
        pdf.bullet_list(strengths[:4], "+")

    if improvements:
        pdf.bullet_heading(improvements_label, C_YELLOW)
        pdf.bullet_list(improvements[:4], ">")


def generate_report(data: dict) -> bytes:
    github = data.get("github")
    resume = data.get("resume")
    portfolio = data.get("portfolio")

    pairs = []
    if github:
        pairs.append((github["overallScore"], 0.35))
    if resume:
        pairs.append((resume["overallScore"], 0.45))
    if portfolio:
        pairs.append((portfolio["overallScore"], 0.20))
    total_w = sum(w for _, w in pairs)
    career_score = round(sum(s * w for s, w in pairs) / total_w) if pairs else 0
    done_count = sum(1 for x in [github, resume, portfolio] if x)

    pdf = DevInsightPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.set_margins(MARGIN, MARGIN, MARGIN)
    pdf.add_page()

    # ── Hero: overall score ──────────────────────────────────────────────
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(*C_WHITE)
    pdf.set_x(MARGIN)
    pdf.cell(CONTENT_W, 11, "Career Analysis Report", align="C", ln=True)

    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(*C_MUTED)
    pdf.cell(CONTENT_W, 7, _safe(_score_label(career_score)), align="C", ln=True)
    pdf.ln(5)

    box_w = 90
    box_x = (PAGE_W - box_w) / 2
    box_y = pdf.get_y()
    pdf.set_fill_color(*C_CARD)
    pdf.set_draw_color(*C_BORDER)
    pdf.rect(box_x, box_y, box_w, 32, style="FD")
    pdf.set_font("Helvetica", "B", 32)
    pdf.set_text_color(*_score_color(career_score))
    pdf.set_xy(box_x, box_y + 4)
    pdf.cell(box_w, 16, str(career_score), align="C")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(*C_MUTED)
    pdf.set_xy(box_x, box_y + 21)
    pdf.cell(box_w, 6, "Overall Career Score (out of 100)", align="C")
    pdf.set_y(box_y + 38)

    if done_count > 0:
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*C_MUTED)
        pdf.cell(CONTENT_W, 6, f"{done_count} of 3 modules analysed", align="C", ln=True)
        pdf.ln(4)

        module_scores = []
        if github:
            module_scores.append(("GitHub", github["overallScore"]))
        if resume:
            module_scores.append(("Resume", resume["overallScore"]))
        if portfolio:
            module_scores.append(("Portfolio", portfolio["overallScore"]))
        pdf.score_row(module_scores)
    pdf.ln(4)

    # ── Per-module sections ──────────────────────────────────────────────
    if github:
        _module_section(
            pdf, "GitHub Analysis", C_ACCENT,
            [
                ("Profile", github.get("profileScore", 0)),
                ("Repos", github.get("repositoryScore", 0)),
                ("Docs", github.get("documentationScore", 0)),
                ("Diversity", github.get("diversityScore", 0)),
            ],
            github.get("summary"),
            github.get("strengths"),
            github.get("suggestions"),
        )

    if resume:
        _module_section(
            pdf, "Resume Analysis", C_BLUE,
            [
                ("ATS", resume.get("atsScore", 0)),
                ("Technical", resume.get("technicalScore", 0)),
                ("Readability", resume.get("readabilityScore", 0)),
                ("Grammar", resume.get("grammarScore", 0)),
            ],
            resume.get("summary"),
            resume.get("strengths"),
            resume.get("improvements"),
        )
        if resume.get("missingKeywords"):
            pdf.bullet_heading("Missing Keywords", C_RED)
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*C_MUTED)
            pdf.set_x(MARGIN)
            pdf.multi_cell(CONTENT_W, 5.5, _safe(", ".join(resume["missingKeywords"][:8])))
            pdf.ln(3)

    if portfolio:
        url_line = f"Analysed: {portfolio['url']}" if portfolio.get("url") else None
        _module_section(
            pdf, "Portfolio Analysis", C_GREEN,
            [
                ("UX", portfolio.get("uxScore", 0)),
                ("Accessibility", portfolio.get("accessibilityScore", 0)),
                ("SEO", portfolio.get("seoScore", 0)),
                ("Content", portfolio.get("contentScore", 0)),
            ],
            portfolio.get("summary"),
            portfolio.get("strengths"),
            portfolio.get("suggestions"),
            improvements_label="Recommendations",
            extra_line=url_line,
        )

    return bytes(pdf.output())
