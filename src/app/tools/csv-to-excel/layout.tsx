import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV to Excel | Free Online File Converter | FileForge",
  description: "Convert CSV files to formatted Excel spreadsheets.",
  keywords: "csv to excel, free online csv to excel, file converter, online tool",
  openGraph: {
    title: "CSV to Excel - Free Online Tool",
    description: "Convert CSV files to formatted Excel spreadsheets.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
