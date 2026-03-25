import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown to PDF | Free Online File Converter | FileForge",
  description: "Render Markdown files as beautiful, formatted PDF documents.",
  keywords: "markdown to pdf, free online markdown to pdf, file converter, online tool",
  openGraph: {
    title: "Markdown to PDF - Free Online Tool",
    description: "Render Markdown files as beautiful, formatted PDF documents.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
