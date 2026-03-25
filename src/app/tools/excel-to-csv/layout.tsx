import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excel to CSV | Free Online File Converter | FileForge",
  description: "Export Excel spreadsheets to universal CSV format.",
  keywords: "excel to csv, free online excel to csv, file converter, online tool",
  openGraph: {
    title: "Excel to CSV - Free Online Tool",
    description: "Export Excel spreadsheets to universal CSV format.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
