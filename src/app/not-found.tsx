import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 grid-pattern">
            <div className="text-center max-w-md">
                <div className="text-8xl font-extrabold gradient-text mb-6">404</div>
                <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
                <p className="text-[#9090b0] mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or that tool is unavailable.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold rounded-xl text-sm"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                    <Link
                        href="/tools"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 glass text-white font-medium rounded-xl text-sm hover:bg-white/[0.08] transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Browse Tools
                    </Link>
                </div>
            </div>
        </div>
    );
}
