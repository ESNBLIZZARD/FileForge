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
    console.log(`[excel-to-pdf] Processing file: ${file.name}, size: ${file.size} bytes`);

    // Lazy-load libraries
    // @ts-ignore
    const XLSX = require("xlsx");
    // @ts-ignore
    const { jsPDF } = require("jspdf");
    // @ts-ignore
    const autoTable = require("jspdf-autotable");

    // Parse Excel workbook
    const workbook = XLSX.read(buffer, { type: "buffer" });
    
    if (workbook.SheetNames.length === 0) {
      return NextResponse.json(
        { error: "The Excel file contains no sheets." },
        { status: 422 }
      );
    }

    // Create PDF
    const doc = new jsPDF({
      orientation: "l", // Landscape is usually better for spreadsheets
      unit: "mm",
      format: "a4",
    });

    workbook.SheetNames.forEach((sheetName: string, index: number) => {
      if (index > 0) {
        doc.addPage();
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length === 0) {
        doc.text(`Sheet: ${sheetName} (Empty)`, 14, 15);
        return;
      }

      // Add sheet title
      doc.setFontSize(14);
      doc.text(`Sheet: ${sheetName}`, 14, 15);

      // Render table
      const head = jsonData[0];
      const body = jsonData.slice(1);

      autoTable(doc, {
        head: [head],
        body: body,
        startY: 20,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [79, 70, 229] }, // Violet color
        margin: { top: 20 },
        theme: 'grid',
      });
    });

    const pdfBuffer = doc.output("arraybuffer");
    const originalName = file.name.replace(/\.(xlsx|xls)$/i, "");
    const outputFilename = `${originalName}_converted.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
      },
    });
  } catch (err: unknown) {
    console.error("[excel-to-pdf] Route error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
