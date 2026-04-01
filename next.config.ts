import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["muhammara", "pdf-to-png-converter", "tesseract.js"],
  webpack: (config, { isServer, webpack }) => {
    // Strip the 'node:' prefix so Webpack treats it as a normal module, which gets caught by our fallback below.
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: any) => {
        resource.request = resource.request.replace(/^node:/, "");
      }),
    );

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
