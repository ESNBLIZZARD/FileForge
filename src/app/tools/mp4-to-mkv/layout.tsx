import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MP4 to MKV | Free Online File Converter | FileForge",
  description: "Convert MP4 videos to MKV format with chapter support.",
  keywords: "mp4 to mkv, free online mp4 to mkv, file converter, online tool",
  openGraph: {
    title: "MP4 to MKV - Free Online Tool",
    description: "Convert MP4 videos to MKV format with chapter support.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
