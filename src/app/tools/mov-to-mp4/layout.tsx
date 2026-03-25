import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MOV to MP4 | Free Online File Converter | FileForge",
  description: "Convert Apple MOV videos to universal MP4 format.",
  keywords: "mov to mp4, free online mov to mp4, file converter, online tool",
  openGraph: {
    title: "MOV to MP4 - Free Online Tool",
    description: "Convert Apple MOV videos to universal MP4 format.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
