"""Convert report text export to PDF using ReportLab."""
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

TXT = Path(r"C:\Users\jayat.ROHITH\Downloads\AthleteForge_Project_Report_READ_IN_NOTEPAD.txt")
OUT = Path(r"C:\Users\jayat.ROHITH\Downloads\AthleteForge_Project_Report_70Pages.pdf")
BACKUP = Path(__file__).parent / "AthleteForge_Project_Report_70Pages.pdf"


def esc(text: str) -> str:
    text = (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\u2014", "-")
        .replace("\u2013", "-")
    )
    return text


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Times-Roman", 8)
    canvas.setFillColor(colors.grey)
    canvas.drawCentredString(A4[0] / 2, 1.2 * cm, "ATHLETEFORGE  |  DBIMSCA")
    canvas.drawCentredString(A4[0] / 2, 0.8 * cm, f"Page {doc.page}")
    canvas.restoreState()


def style_for(line: str):
    s = line.strip()
    if s.startswith("=") and len(s) > 10:
        return ParagraphStyle("h1", fontName="Times-Bold", fontSize=15, spaceAfter=10, spaceBefore=14)
    if s.startswith("---"):
        return ParagraphStyle("h2", fontName="Times-Bold", fontSize=12, spaceAfter=8, spaceBefore=10)
    if s.startswith("###"):
        return ParagraphStyle("h3", fontName="Times-Bold", fontSize=11, spaceAfter=6, spaceBefore=8)
    if s.startswith("[TABLE"):
        return ParagraphStyle("th", fontName="Times-Bold", fontSize=10, spaceAfter=4, spaceBefore=6)
    if " | " in s:
        return ParagraphStyle("tr", fontName="Times-Roman", fontSize=8, leading=10, spaceAfter=3)
    return ParagraphStyle("body", fontName="Times-Roman", fontSize=10, leading=13, alignment=TA_JUSTIFY, spaceAfter=5)


def clean_line(line: str) -> str:
    s = line.strip()
    if s.startswith("="):
        s = s.strip("=").strip()
    elif s.startswith("---"):
        s = s.strip("- ").strip()
    elif s.startswith("###"):
        s = s[4:].strip()
    return s


def main():
    if not TXT.exists():
        raise FileNotFoundError(f"Missing: {TXT}")

    story = []
    for raw in TXT.read_text(encoding="utf-8").splitlines():
        if not raw.strip():
            story.append(Spacer(1, 4))
            continue
        text = clean_line(raw)
        if not text:
            continue
        st = style_for(raw)
        if st.name == "h1" and "CHAPTER" in text.upper() and len(story) > 10:
            from reportlab.platypus import PageBreak
            story.append(PageBreak())
        story.append(Paragraph(esc(text), st))

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=2.5 * cm,
        rightMargin=2.5 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2 * cm,
        title="AthleteForge Project Report",
    )
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    BACKUP.write_bytes(OUT.read_bytes())
    print(f"PDF created: {OUT}")
    print(f"Size: {OUT.stat().st_size / 1024:.1f} KB")
    print(f"Backup: {BACKUP}")


if __name__ == "__main__":
    main()