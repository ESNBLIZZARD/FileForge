import { NextRequest, NextResponse } from "next/server";
// Top-level imports removed to avoid static analysis issues during build
// @ts-ignore

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(`[ppt-to-pdf] Processing file: ${file.name}, size: ${file.size} bytes`);

    // Lazy-load libraries
    // @ts-ignore
    const { jsPDF } = require("jspdf");
    // @ts-ignore
    const pptxParser = require("pptx-parser");

    // Parse PPTX
    let result;
    try {
        result = await pptxParser.parse(buffer);
    } catch (parseErr) {
        console.error("[ppt-to-pdf] pptx-parser failed:", parseErr);
        throw new Error("Failed to parse the PowerPoint file. It might be corrupted or in an unsupported format.");
    }

    if (!result || !result.slides || result.slides.length === 0) {
      return NextResponse.json(
        { error: "No slides found in this PowerPoint presentation." },
        { status: 422 }
      );
    }

    // Create PDF
    const doc = new jsPDF({
      orientation: "l", // Presentations are almost always landscape
      unit: "mm",
      format: "a4",
    });

    const marginLeft = 20;
    const marginTop = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - marginLeft * 2;
    const pageHeight = doc.internal.pageSize.getHeight();

    result.slides.forEach((slide: any, index: number) => {
      if (index > 0) {
        doc.addPage();
      }

      // Add slide number
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Slide ${index + 1}`, pageWidth - marginLeft - 10, pageHeight - 10);

      let cursorY = marginTop;
      doc.setTextColor(0, 0, 0);

      // Extract and render title if exists
      if (slide.title) {
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(slide.title, contentWidth);
        titleLines.forEach((line: string) => {
            doc.text(line, marginLeft, cursorY);
            cursorY += 12;
        });
        cursorY += 5;
      }

      // Extract and render body text
      if (slide.text && Array.isArray(slide.text)) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        
        slide.text.forEach((item: string) => {
          if (!item || item.trim().length === 0) return;
          
          const lines = doc.splitTextToSize(item, contentWidth);
          lines.forEach((line: string) => {
            if (cursorY + 8 > pageHeight - 20) {
                // Should we overflow to next page? For PPT slides, usually we just clip or scale.
                // Here we'll just stop adding text to this "slide page" as it's a simplification.
                return;
            }
            doc.text(line, marginLeft, cursorY);
            cursorY += 8;
          });
          cursorY += 4;
        });
      }
    });

    const pdfBuffer = doc.output("arraybuffer");
    const originalName = file.name.replace(/\.(pptx|ppt)$/i, "");
    const outputFilename = `${originalName}_converted.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
      },
    });
  } catch (err: unknown) {
    console.error("[ppt-to-pdf] Route error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
