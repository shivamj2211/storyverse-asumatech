const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,

  // ✅ production me PWA ON, dev me OFF
  disable: process.env.NODE_ENV !== "production",

  // ✅ App Router me kabhi kabhi ye files 404 hoti hain
  buildExcludes: [
    /app-build-manifest\.json$/,
    /build-manifest\.json$/,
  ],

  // ✅ Offline install criteria ke liye fallback must
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 5,
        fallbackURL: "/offline.html",
      },
    },
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
