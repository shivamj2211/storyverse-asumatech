const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV !== "production",

  // ✅ stop precaching files that can be missing in app router
  buildExcludes: [
    /app-build-manifest\.json$/,
    /build-manifest\.json$/,
  ],
});


/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_API_URL;
    return base
      ? [{ source: "/api/:path*", destination: `${base}/api/:path*` }]
      : [];
  },
};

module.exports = withPWA(nextConfig);
