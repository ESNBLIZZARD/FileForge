import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PowerPoint to PDF | Free Online File Converter | FileForge",
  description: "Convert PowerPoint presentations to PDF instantly.",
  keywords: "powerpoint to pdf, free online powerpoint to pdf, file converter, online tool",
  openGraph: {
    title: "PowerPoint to PDF - Free Online Tool",
    description: "Convert PowerPoint presentations to PDF instantly.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
