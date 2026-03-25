import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unlock PDF | Free Online File Converter | FileForge",
  description: "Remove password protection from PDF files.",
  keywords: "unlock pdf, free online unlock pdf, file converter, online tool",
  openGraph: {
    title: "Unlock PDF - Free Online Tool",
    description: "Remove password protection from PDF files.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
