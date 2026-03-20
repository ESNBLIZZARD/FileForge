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
    console.log(`[word-to-pdf] Processing file: ${file.name}, size: ${file.size} bytes`);

    // Lazy-load libraries
    // @ts-ignore
    const mammoth = require("mammoth");
    // @ts-ignore
    const { jsPDF } = require("jspdf");

    // Extract text from DOCX using mammoth
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    const messages = result.messages;
    
    if (messages.length > 0) {
        console.log("[word-to-pdf] Mammoth messages:", messages);
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No readable text found in this Word document." },
        { status: 422 }
      );
    }

    // Create PDF using jsPDF
    const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
    });

    const marginLeft = 20;
    const marginTop = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - marginLeft * 2;
    const lineHeight = 7;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const lines = doc.splitTextToSize(text, contentWidth);
    
    let cursorY = marginTop;
    const pageHeight = doc.internal.pageSize.getHeight();

    lines.forEach((line: string) => {
        if (cursorY + lineHeight > pageHeight - marginTop) {
            doc.addPage();
            cursorY = marginTop;
        }
        doc.text(line, marginLeft, cursorY);
        cursorY += lineHeight;
    });

    const pdfBuffer = doc.output("arraybuffer");
    const originalName = file.name.replace(/\.(docx|doc)$/i, "");
    const outputFilename = `${originalName}_converted.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
      },
    });
  } catch (err: unknown) {
    console.error("[word-to-pdf] Route error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
