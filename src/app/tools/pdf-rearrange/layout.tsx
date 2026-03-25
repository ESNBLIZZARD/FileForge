import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rearrange PDF | Free Online File Converter | FileForge",
  description: "Drag and drop PDF pages to reorder, delete, or rotate them.",
  keywords: "rearrange pdf, free online rearrange pdf, file converter, online tool",
  openGraph: {
    title: "Rearrange PDF - Free Online Tool",
    description: "Drag and drop PDF pages to reorder, delete, or rotate them.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
