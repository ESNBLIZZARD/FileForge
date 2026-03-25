import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Excel | Free Online File Converter | FileForge",
  description: "Extract tables and data from PDF into structured Excel spreadsheets.",
  keywords: "pdf to excel, free online pdf to excel, file converter, online tool",
  openGraph: {
    title: "PDF to Excel - Free Online Tool",
    description: "Extract tables and data from PDF into structured Excel spreadsheets.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
