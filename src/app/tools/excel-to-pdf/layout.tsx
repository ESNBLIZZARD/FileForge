import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excel to PDF | Free Online File Converter | FileForge",
  description: "Convert Excel spreadsheets to PDF for easy sharing.",
  keywords: "excel to pdf, free online excel to pdf, file converter, online tool",
  openGraph: {
    title: "Excel to PDF - Free Online Tool",
    description: "Convert Excel spreadsheets to PDF for easy sharing.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
