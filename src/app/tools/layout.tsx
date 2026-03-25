import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "All Free File Conversion Tools | FileForge",
  description: "Browse 40+ free online file converters for PDF, Image, Audio, Video, and Document formats. Fast, secure, and private file conversion.",
  keywords: "file conversion tools, free online converter, pdf tools, image converter, video conversion, audio converter",
};

export default async function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
