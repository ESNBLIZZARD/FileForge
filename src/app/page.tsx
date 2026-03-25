import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Zap,
  Lock,
  Globe,
  CheckCircle,
  Star,
} from "lucide-react";
import { tools, categories } from "@/lib/tools";
import ToolCard from "@/components/tools/ToolCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FileForge | Free Online File Converter - PDF, Image, Video, Audio",
  description: "Convert any file format online for free with FileForge. Securely convert PDF, images, audio, video, and more in seconds. No registration required.",
  keywords: "free online file converter, file conversion, pdf converter, image converter, video conversion, convert files online, secure file converter, fast file conversion",
  openGraph: {
    title: "FileForge - Fast & Secure File Conversion",
    description: "Convert any file instantly. PDF, image, audio, video, and data conversions — all in one place. Runs entirely in your browser.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FileForge - Online File Converter",
    description: "Convert any file securely and instantly.",
  }
};

const stats = [
  { label: "Files Converted", value: "2.4M+" },
  { label: "Happy Users", value: "180K+" },
  { label: "Tools Available", value: "40+" },
  { label: "Uptime", value: "99.9%" },
];

const features = [
  {
    icon: Shield,
    title: "Bank-Level Security",
    description:
      "All files are encrypted in transit and at rest. Auto-deleted after processing.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Powered by high-performance cloud workers. Standard files convert in under 10 seconds.",
  },
  {
    icon: Lock,
    title: "Fully Private",
    description:
      "We never share, sell, or analyze your file contents. Your data stays yours.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description:
      "Runs entirely in your browser. No software to install, works on any device.",
  },
];

const testimonials = [
  {
    name: "Sarah K.",
    role: "Marketing Manager",
    text: "FileForge saves me hours every week. The PDF to Word conversion is incredibly accurate.",
    stars: 5,
  },
  {
    name: "Dev Patel",
    role: "Full-Stack Developer",
    text: "The JSON↔CSV and YAML↔JSON tools are exactly what I needed for my data pipelines.",
    stars: 5,
  },
  {
    name: "Maria L.",
    role: "Content Creator",
    text: "HEIC to JPG conversion works flawlessly. Finally a tool that handles all my iPhone photos.",
    stars: 5,
  },
];

export default function Home() {
  const featuredTools = tools.slice(0, 12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "FileForge",
    "description": "Free and secure online file conversion tool supporting PDF, images, video, audio, and data formats.",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center grid-pattern pt-16">
        {/* Glow Orbs */}
        <div
          className="hero-glow bg-violet-600 top-1/4 left-1/4"
          style={{ transform: "translate(-50%, -50%)" }}
        />
        <div
          className="hero-glow bg-cyan-600 bottom-1/4 right-1/4"
          style={{ transform: "translate(50%, 50%)" }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center py-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-violet-300 mb-8 fade-in-up">
            <Zap className="w-3.5 h-3.5 fill-violet-400 text-violet-400" />
            <span>40+ File Tools — All Free, No Sign-up Required</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6 fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Free Online <span className="gradient-text">File Converter</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-[#9090b0] max-w-2xl mx-auto mb-10 leading-relaxed fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Convert any file instantly. PDF, image, audio, video, and data conversions — all in one place.
            Secure, fast, and completely free to start.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16 fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href="/tools"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-violet-400 transition-all shadow-xl shadow-violet-900/40 text-base"
            >
              Explore All Tools
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 glass text-white font-medium rounded-xl hover:bg-white/[0.08] transition-all text-base"
            >
              View Pricing
            </Link>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-5 text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">
                  {s.value}
                </div>
                <div className="text-xs text-[#9090b0] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick-access Category Tabs */}
      <section className="py-6 border-y border-white/[0.06] bg-[#0d0d1a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/tools?cat=${cat.id}`}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-[#9090b0] hover:text-white hover:border-white/20 transition-all whitespace-nowrap"
              >
                <span>{cat.label}</span>
                <span className="text-xs bg-violet-600/30 text-violet-300 px-1.5 py-0.5 rounded-full">
                  {cat.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools Grid */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Most Popular File Conversion Tools
            </h2>
            <p className="text-[#9090b0] text-lg max-w-xl mx-auto">
              Our most-used converters — start converting with one click.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredTools.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-8 py-4 glass rounded-xl text-white font-medium hover:bg-white/[0.08] transition-all glass-hover"
            >
              View All {tools.length} Tools
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-[#0d0d1a] border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Why Choose FileForge for File Conversion?
            </h2>
            <p className="text-[#9090b0] text-lg max-w-xl mx-auto">
              Built with privacy and performance at its core for seamless online conversion.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="glass rounded-2xl p-6 glass-hover group"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center mb-4 group-hover:bg-violet-600/30 transition-colors">
                    <Icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {f.title}
                  </h3>
                  <p className="text-[#9090b0] text-sm leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              How to Convert Files Online in 3 Steps
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-violet-600/0 via-violet-600/60 to-violet-600/0" />
            {[
              {
                step: "01",
                title: "Pick a Tool",
                desc: "Choose from 40+ conversion tools across all file types.",
              },
              {
                step: "02",
                title: "Upload File",
                desc: "Drag & drop or click to upload. Up to 100MB for free.",
              },
              {
                step: "03",
                title: "Download",
                desc: "Conversion completes in seconds. Download your file.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-20 h-20 rounded-2xl glass mx-auto flex items-center justify-center mb-6 gradient-border">
                  <span className="text-2xl font-bold gradient-text">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-xl mb-2">
                  {item.title}
                </h3>
                <p className="text-[#9090b0] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-[#0d0d1a] border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Loved by users
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6 glass-hover">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-[#c0c0d8] text-sm leading-relaxed mb-4">
                  &quot;{t.text}&quot;
                </p>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-[#9090b0] text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div
          className="hero-glow bg-violet-700 top-1/2 left-1/2"
          style={{ transform: "translate(-50%, -50%)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to convert?
          </h2>
          <p className="text-[#9090b0] text-lg mb-10 max-w-lg mx-auto">
            Join 180,000+ users who trust FileForge for fast, secure file
            conversions every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-violet-400 transition-all shadow-2xl shadow-violet-900/50 text-base"
            >
              Start Converting — It&apos;s Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-[#9090b0] text-sm mt-6 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            No credit card required &nbsp;·&nbsp;
            <CheckCircle className="w-4 h-4 text-green-500" />
            Files auto-deleted after 1 hour
          </p>
        </div>
      </section>
    </div>
  );
}
