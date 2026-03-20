import { NextRequest, NextResponse } from "next/server";
import { pdfToPng } from "pdf-to-png-converter";
import { createWorker } from "tesseract.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    let worker: Tesseract.Worker | null = null;
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "File is required" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();

        // Convert PDF to PNG images
        // pdf-to-png-converter returns an array of objects for each page
        const pngPages = await pdfToPng(arrayBuffer, {
            viewportScale: 2.0, // Scale for better OCR accuracy
        });

        if (!pngPages || pngPages.length === 0) {
            throw new Error("Failed to rasterize PDF pages");
        }

        // Initialize Tesseract worker
        worker = await createWorker('eng');

        let fullText = "";
        
        // Process each page
        // We'll process them sequentially to avoid memory issues with Tesseract 
        // but we could parallelize for speed if memory allows
        for (let i = 0; i < pngPages.length; i++) {
            const page = pngPages[i];
            if (!page.content) continue;
            // Tesseract recognize in Node often works best with Buffer
            const { data: { text } } = await worker.recognize(Buffer.from(page.content));
            fullText += `--- Page ${i + 1} ---\n\n${text}\n\n`;
        }

        await worker.terminate();
        worker = null;

        return NextResponse.json({ text: fullText.trim() });

    } catch (err: any) {
        if (worker) await (worker as Tesseract.Worker).terminate();
        console.error("OCR PDF API error:", err);
        return NextResponse.json({ error: "Failed to perform OCR on PDF" }, { status: 500 });
    }
}
