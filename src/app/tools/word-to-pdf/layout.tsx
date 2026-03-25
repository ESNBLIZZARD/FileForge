import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word to PDF | Free Online File Converter | FileForge",
  description: "Convert Word documents to PDF with perfect layout preservation.",
  keywords: "word to pdf, free online word to pdf, file converter, online tool",
  openGraph: {
    title: "Word to PDF - Free Online Tool",
    description: "Convert Word documents to PDF with perfect layout preservation.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
