import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MP4 to AVI | Free Online File Converter | FileForge",
  description: "Convert MP4 to AVI for legacy device compatibility.",
  keywords: "mp4 to avi, free online mp4 to avi, file converter, online tool",
  openGraph: {
    title: "MP4 to AVI - Free Online Tool",
    description: "Convert MP4 to AVI for legacy device compatibility.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
