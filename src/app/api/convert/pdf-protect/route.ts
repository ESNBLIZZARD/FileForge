import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
// Top-level import removed to avoid Turbopack static analysis issues with native modules
import { Readable } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const password = formData.get("password") as string;

        if (!file || !password) {
            return NextResponse.json(
                { message: "File and password are required." },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);
        
        // Lazy-load muhammara inside the handler to satisfy Next.js static analysis
        const muhammara = require("muhammara");
        
        // Output buffer stream provided by muhammara
        const outStream = new muhammara.PDFWStreamForBuffer();
        
        // Create writer with password protection
        const pdfWriter = muhammara.createWriter(outStream, {
            userPassword: password,
            ownerPassword: password, // Setting both for standard protection
            compress: true
        });

        // Create reader for the input buffer
        const pdfReader = new muhammara.PDFRStreamForBuffer(inputBuffer);
        
        // Append all pages from the input PDF
        pdfWriter.appendPDFPagesFromPDF(pdfReader);
        
        // Finalize the PDF
        pdfWriter.end();

        const protectedBuffer = outStream.buffer;

        return new NextResponse(new Uint8Array(protectedBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="protected_${file.name}"`,
            },
        });

    } catch (err: any) {
        console.error("Protect PDF API error:", err);
        return NextResponse.json(
            { message: err.message || "Internal server error during PDF protection." },
            { status: 500 }
        );
    }
}
