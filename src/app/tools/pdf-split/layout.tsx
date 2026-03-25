import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF | Free Online File Converter | FileForge",
  description: "Split a PDF into multiple files or extract specific pages.",
  keywords: "split pdf, free online split pdf, file converter, online tool",
  openGraph: {
    title: "Split PDF - Free Online Tool",
    description: "Split a PDF into multiple files or extract specific pages.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
