import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress Image | Free Online File Converter | FileForge",
  description: "Reduce image file size with smart compression algorithms.",
  keywords: "compress image, free online compress image, file converter, online tool",
  openGraph: {
    title: "Compress Image - Free Online Tool",
    description: "Reduce image file size with smart compression algorithms.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
