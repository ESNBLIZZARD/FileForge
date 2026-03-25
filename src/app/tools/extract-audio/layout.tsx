import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Extract Audio | Free Online File Converter | FileForge",
  description: "Pull the audio track from any video file as MP3 or WAV.",
  keywords: "extract audio, free online extract audio, file converter, online tool",
  openGraph: {
    title: "Extract Audio - Free Online Tool",
    description: "Pull the audio track from any video file as MP3 or WAV.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
