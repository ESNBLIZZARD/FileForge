import { CheckCircle, X, Zap } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing — FileForge",
    description: "Choose the plan that fits your needs. Start free, upgrade when you need more.",
};

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Perfect for occasional file conversions.",
        color: "border-white/[0.12]",
        badge: null,
        cta: "Start Free",
        ctaClass: "glass hover:bg-white/[0.08] text-white",
        features: [
            { text: "40+ conversion tools", included: true },
            { text: "Up to 100MB per file", included: true },
            { text: "5 conversions per day", included: true },
            { text: "Standard processing speed", included: true },
            { text: "Files deleted after 1 hour", included: true },
            { text: "Conversion history", included: false },
            { text: "Batch processing", included: false },
            { text: "API access", included: false },
            { text: "Priority support", included: false },
        ],
    },
    {
        name: "Pro",
        price: "$9",
        period: "per month",
        description: "For professionals who convert files daily.",
        color: "border-violet-500/60",
        badge: "Most Popular",
        cta: "Start Pro Trial",
        ctaClass:
            "bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-xl shadow-violet-900/40",
        features: [
            { text: "40+ conversion tools", included: true },
            { text: "Up to 500MB per file", included: true },
            { text: "Unlimited conversions", included: true },
            { text: "Faster processing speed", included: true },
            { text: "Files deleted after 24 hours", included: true },
            { text: "30-day conversion history", included: true },
            { text: "Batch processing (up to 20)", included: true },
            { text: "API access", included: false },
            { text: "Priority support", included: false },
        ],
    },
    {
        name: "Premium",
        price: "$29",
        period: "per month",
        description: "For teams and power users needing everything.",
        color: "border-amber-500/40",
        badge: "Best Value",
        cta: "Go Premium",
        ctaClass:
            "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-xl shadow-amber-900/30",
        features: [
            { text: "40+ conversion tools", included: true },
            { text: "Unlimited file size", included: true },
            { text: "Unlimited conversions", included: true },
            { text: "Fastest processing (priority queue)", included: true },
            { text: "Files deleted after 7 days", included: true },
            { text: "Full conversion history", included: true },
            { text: "Batch processing (unlimited)", included: true },
            { text: "Full API access", included: true },
            { text: "24/7 priority support", included: true },
        ],
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen pt-24 pb-24 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-violet-300 mb-6">
                        <Zap className="w-3.5 h-3.5 fill-violet-400 text-violet-400" />
                        Simple, transparent pricing
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Pick Your <span className="gradient-text">Plan</span>
                    </h1>
                    <p className="text-[#9090b0] text-lg max-w-xl mx-auto">
                        Start free forever. Upgrade when you need higher limits, batch
                        processing, or API access.
                    </p>
                </div>

                {/* Plans */}
                <div className="grid lg:grid-cols-3 gap-8 mb-16">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative glass rounded-3xl p-8 border ${plan.color} transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-black/40`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    <span
                                        className={`text-xs font-bold px-4 py-1 rounded-full ${plan.name === "Pro"
                                                ? "bg-violet-600 text-white"
                                                : "bg-amber-500 text-black"
                                            }`}
                                    >
                                        {plan.badge}
                                    </span>
                                </div>
                            )}
                            <div className="mb-6">
                                <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                                <p className="text-[#9090b0] text-sm">{plan.description}</p>
                            </div>
                            <div className="mb-8">
                                <span className="text-5xl font-extrabold text-white">
                                    {plan.price}
                                </span>
                                <span className="text-[#9090b0] text-sm ml-2">/ {plan.period}</span>
                            </div>
                            <Link
                                href="/login"
                                className={`block w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all mb-8 ${plan.ctaClass}`}
                            >
                                {plan.cta}
                            </Link>
                            <ul className="space-y-3">
                                {plan.features.map((f) => (
                                    <li key={f.text} className="flex items-start gap-3">
                                        {f.included ? (
                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <X className="w-4 h-4 text-white/20 mt-0.5 flex-shrink-0" />
                                        )}
                                        <span
                                            className={`text-sm ${f.included ? "text-[#c0c0d8]" : "text-white/30"}`}
                                        >
                                            {f.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-10">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: "Do I need to create an account to use FileForge?",
                                a: "No! You can convert files without an account. Creating an account unlocks conversion history and higher limits.",
                            },
                            {
                                q: "Are my files secure?",
                                a: "Absolutely. All uploads are encrypted in transit (HTTPS) and at rest. Files are automatically deleted per your plan's retention policy.",
                            },
                            {
                                q: "What's the maximum file size?",
                                a: "Free users can upload up to 100MB per file. Pro users get 500MB, and Premium users have no file size limit.",
                            },
                            {
                                q: "Can I cancel my subscription anytime?",
                                a: "Yes. You can cancel your Pro or Premium plan at any time from your dashboard. No questions asked.",
                            },
                        ].map((faq) => (
                            <div key={faq.q} className="glass rounded-2xl p-6">
                                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                                <p className="text-[#9090b0] text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
