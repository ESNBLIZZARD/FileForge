import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF | Free Online File Converter | FileForge",
  description: "Reduce PDF file size while maintaining quality.",
  keywords: "compress pdf, free online compress pdf, file converter, online tool",
  openGraph: {
    title: "Compress PDF - Free Online Tool",
    description: "Reduce PDF file size while maintaining quality.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
