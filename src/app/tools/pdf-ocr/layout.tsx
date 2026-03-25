import { Metadata } from "next";

export const metadata: Metadata = {
  title: "OCR PDF | Free Online File Converter | FileForge",
  description: "Extract searchable text from scanned PDFs using OCR technology.",
  keywords: "ocr pdf, free online ocr pdf, file converter, online tool",
  openGraph: {
    title: "OCR PDF - Free Online Tool",
    description: "Extract searchable text from scanned PDFs using OCR technology.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
