import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resize Image | Free Online File Converter | FileForge",
  description: "Change image dimensions while preserving aspect ratio.",
  keywords: "resize image, free online resize image, file converter, online tool",
  openGraph: {
    title: "Resize Image - Free Online Tool",
    description: "Change image dimensions while preserving aspect ratio.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
