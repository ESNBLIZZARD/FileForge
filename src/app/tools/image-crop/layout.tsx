import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crop & Rotate | Free Online File Converter | FileForge",
  description: "Crop and rotate images with a precision editor.",
  keywords: "crop & rotate, free online crop & rotate, file converter, online tool",
  openGraph: {
    title: "Crop & Rotate - Free Online Tool",
    description: "Crop and rotate images with a precision editor.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
