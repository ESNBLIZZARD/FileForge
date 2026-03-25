import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Protect PDF | Free Online File Converter | FileForge",
  description: "Password protect your PDF files with strong encryption.",
  keywords: "protect pdf, free online protect pdf, file converter, online tool",
  openGraph: {
    title: "Protect PDF - Free Online Tool",
    description: "Password protect your PDF files with strong encryption.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
