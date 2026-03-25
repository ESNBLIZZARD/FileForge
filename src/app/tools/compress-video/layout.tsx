import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress Video | Free Online File Converter | FileForge",
  description: "Reduce video file size while keeping acceptable quality.",
  keywords: "compress video, free online compress video, file converter, online tool",
  openGraph: {
    title: "Compress Video - Free Online Tool",
    description: "Reduce video file size while keeping acceptable quality.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
