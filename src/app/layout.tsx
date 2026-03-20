import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FileForge — Universal File Converter",
  description:
    "Convert, compress, merge, and edit PDF, image, audio, video, and data files online. Free, fast, and secure.",
  keywords: [
    "file converter",
    "PDF to Word",
    "compress PDF",
    "image converter",
    "online tools",
  ],
  openGraph: {
    title: "FileForge — Universal File Converter",
    description: "40+ free online file conversion and utility tools.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
