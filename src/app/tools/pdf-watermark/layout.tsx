import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watermark PDF | Free Online File Converter | FileForge",
  description: "Add custom text or image watermarks to PDF pages.",
  keywords: "watermark pdf, free online watermark pdf, file converter, online tool",
  openGraph: {
    title: "Watermark PDF - Free Online Tool",
    description: "Add custom text or image watermarks to PDF pages.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
