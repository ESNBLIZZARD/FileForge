import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Word | Free Online File Converter | FileForge",
  description: "Convert PDF files to editable Word documents with perfect formatting.",
  keywords: "pdf to word, free online pdf to word, file converter, online tool",
  openGraph: {
    title: "PDF to Word - Free Online Tool",
    description: "Convert PDF files to editable Word documents with perfect formatting.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
