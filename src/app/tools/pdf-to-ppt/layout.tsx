import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to PowerPoint | Free Online File Converter | FileForge",
  description: "Convert PDF presentations back to editable PowerPoint slides.",
  keywords: "pdf to powerpoint, free online pdf to powerpoint, file converter, online tool",
  openGraph: {
    title: "PDF to PowerPoint - Free Online Tool",
    description: "Convert PDF presentations back to editable PowerPoint slides.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
