import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML to PDF | Free Online File Converter | FileForge",
  description: "Convert any HTML page or file to a professional PDF document.",
  keywords: "html to pdf, free online html to pdf, file converter, online tool",
  openGraph: {
    title: "HTML to PDF - Free Online Tool",
    description: "Convert any HTML page or file to a professional PDF document.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
