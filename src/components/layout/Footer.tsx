import Link from "next/link";
import { Zap, Twitter, Github, Linkedin, Heart } from "lucide-react";

const footerLinks = {
    "PDF Tools": [
        { label: "PDF to Word", href: "/tools/pdf-to-word" },
        { label: "PDF to Excel", href: "/tools/pdf-to-excel" },
        { label: "PDF to Image", href: "/tools/pdf-to-image" },
        { label: "Merge PDF", href: "/tools/merge-pdf" },
        { label: "Compress PDF", href: "/tools/compress-pdf" },
    ],
    "Image Tools": [
        { label: "JPG to PNG", href: "/tools/jpg-to-png" },
        { label: "PNG to WebP", href: "/tools/png-to-webp" },
        { label: "Compress Image", href: "/tools/compress-image" },
        { label: "Resize Image", href: "/tools/resize-image" },
        { label: "HEIC to JPG", href: "/tools/heic-to-jpg" },
    ],
    "More Tools": [
        { label: "MP3 to WAV", href: "/tools/mp3-to-wav" },
        { label: "CSV to Excel", href: "/tools/csv-to-xlsx" },
        { label: "JSON to CSV", href: "/tools/json-to-csv" },
        { label: "YAML to JSON", href: "/tools/yaml-to-json" },
        { label: "All Tools", href: "/tools" },
    ],
    Company: [
        { label: "Pricing", href: "/pricing" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Contact", href: "#" },
    ],
};

export default function Footer() {
    return (
        <footer className="border-t border-white/[0.06] bg-[#06060f]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg text-white tracking-tight">
                                File<span className="gradient-text">Forge</span>
                            </span>
                        </Link>
                        <p className="text-sm text-[#9090b0] leading-relaxed mb-6 max-w-xs">
                            40+ free online tools to convert, compress, and edit your files.
                            Fast, secure, and private.
                        </p>
                        <div className="flex items-center gap-3">
                            <a
                                href="#"
                                className="p-2 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-all"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="p-2 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-all"
                                aria-label="GitHub"
                            >
                                <Github className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="p-2 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-all"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-[#9090b0] hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[#9090b0]">
                        © {new Date().getFullYear()} FileForge. All rights reserved.
                    </p>
                    <p className="text-xs text-[#9090b0] flex items-center gap-1">
                        Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for creators worldwide
                    </p>
                </div>
            </div>
        </footer>
    );
}
