import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF | Free Online File Converter | FileForge",
  description: "Combine multiple PDF files into one document in seconds.",
  keywords: "merge pdf, free online merge pdf, file converter, online tool",
  openGraph: {
    title: "Merge PDF - Free Online Tool",
    description: "Combine multiple PDF files into one document in seconds.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
