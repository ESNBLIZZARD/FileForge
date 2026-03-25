import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Image | Free Online File Converter | FileForge",
  description: "Convert each PDF page to high-quality PNG or JPG images.",
  keywords: "pdf to image, free online pdf to image, file converter, online tool",
  openGraph: {
    title: "PDF to Image - Free Online Tool",
    description: "Convert each PDF page to high-quality PNG or JPG images.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
