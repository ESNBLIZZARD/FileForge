import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["muhammara", "pdf-to-png-converter", "tesseract.js"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
      };
      
      // Specifically handle 'node:' prefixed modules for newer library bundles
      config.resolve.alias = {
        ...config.resolve.alias,
        "node:fs": false,
        "node:https": false,
        "node:http": false,
        "node:path": false,
        "node:os": false,
        "node:stream": false,
        "node:zlib": false,
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
  // Only add turbopack config if not on Vercel to avoid warnings on Next.js 15
  ...(!process.env.VERCEL && { turbopack: {} }),
};

export default nextConfig;
