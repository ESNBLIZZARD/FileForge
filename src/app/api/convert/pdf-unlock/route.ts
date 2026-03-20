import { NextRequest, NextResponse } from "next/server";
import muhammara from "muhammara";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const password = formData.get("password") as string;

        if (!file || !password) {
            return NextResponse.json({ error: "File and password are required" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);
        
        // Output buffer stream
        const outStream = new muhammara.PDFWStreamForBuffer();
        
        // Create writer (unencrypted by default)
        const pdfWriter = muhammara.createWriter(outStream, {
            compress: true
        });

        // Create reader with the user-provided password
        const pdfReader = new muhammara.PDFRStreamForBuffer(inputBuffer);
        
        try {
            // This will try to open the PDF. If password is wrong, it might throw or return a state.
            // In muhammara, createReader or appendPDFPagesFromPDF with options is used.
            pdfWriter.appendPDFPagesFromPDF(pdfReader, { password });
        } catch (readErr) {
            console.error("Decryption error (likely wrong password):", readErr);
            return NextResponse.json({ error: "Invalid password or corrupted PDF" }, { status: 401 });
        }
        
        pdfWriter.end();

        const decryptedBuffer = outStream.buffer;

        return new NextResponse(new Uint8Array(decryptedBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="unlocked_${file.name}"`,
            },
        });

    } catch (err: any) {
        console.error("Unlock PDF API error:", err);
        return NextResponse.json({ error: "Failed to unlock PDF" }, { status: 500 });
    }
}
