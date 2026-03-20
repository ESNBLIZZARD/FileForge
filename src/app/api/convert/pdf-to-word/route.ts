import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";

// pdf2json is a CJS module
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFParser = require("pdf2json");

type PdfParserError = {
  parserError?: Error;
};

type PdfParserWithText = {
  on: (
    event: "pdfParser_dataError" | "pdfParser_dataReady",
    listener: (payload?: PdfParserError) => void
  ) => void;
  parseBuffer: (buffer: Buffer) => void;
  getRawTextContent: () => string;
};

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Heuristic: treat a short ALL-CAPS block as a heading.
 */
function isHeading(text: string): boolean {
  const trimmed = text.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= 80 &&
    !trimmed.endsWith(".") &&
    trimmed === trimmed.toUpperCase()
  );
}

/**
 * Build docx Document from extracted text.
 */
function buildDocx(text: string): Document {
  const rawBlocks = text
    .split(/\n{2,}/)
    .map((b) => b.replace(/\n/g, " ").trim())
    .filter(Boolean);

  const children: Paragraph[] = rawBlocks.map((block) => {
    if (isHeading(block)) {
      return new Paragraph({
        text: block,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      });
    }

    return new Paragraph({
      children: [
        new TextRun({
          text: block,
          font: "Calibri",
          size: 24, // 12pt
        }),
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 160 },
    });
  });

  return new Document({
    creator: "FileForge",
    title: "Converted Document",
    sections: [{ children }],
  });
}

/**
 * Extract text using pdf2json.
 */
async function extractTextWithPdf2Json(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1) as PdfParserWithText; // 1 = text content only

    pdfParser.on("pdfParser_dataError", (errData?: PdfParserError) => {
      reject(errData?.parserError ?? new Error("PDF parsing failed"));
    });
    pdfParser.on("pdfParser_dataReady", () => {
      // pdfParser.getRawTextContent() returns the plain text extracted
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });

    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(`[pdf-to-word] Processing file: ${file.name}, size: ${file.size} bytes`);

    let extractedText = "";
    try {
      extractedText = await extractTextWithPdf2Json(buffer);
      console.log(`[pdf-to-word] Text extracted length: ${extractedText.length}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`[pdf-to-word] pdf2json extraction failed:`, err);
      return NextResponse.json(
        { error: `PDF parsing failed: ${message}` },
        { status: 422 }
      );
    }

    if (!extractedText || extractedText.trim().length < 5) {
      return NextResponse.json(
        {
          error: "No readable text found in this PDF. It may be a scanned image.",
        },
        { status: 422 }
      );
    }

    const doc = buildDocx(extractedText);
    const docxBuffer = await Packer.toBuffer(doc);

    const originalName = file.name.replace(/\.pdf$/i, "");
    const outputFilename = `${originalName}_converted.docx`;

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
      },
    });
  } catch (err: unknown) {
    console.error("[pdf-to-word] Route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
