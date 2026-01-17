const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,

  // ✅ production me PWA ON, dev me OFF
  disable: process.env.NODE_ENV !== "production",

  // ✅ App Router me kabhi kabhi ye files 404 hoti hain
  buildExcludes: [/app-build-manifest\.json$/, /build-manifest\.json$/],

  // ✅ OFFLINE fallback (Workbox-safe)
  // NOTE: /offline.html file public/ me honi chahiye
  navigateFallback: "/offline.html",
  navigateFallbackDenylist: [
    /^\/api\//,           // API calls ko offline fallback mat do
    /^\/_next\//,         // Next internal assets
    /^\/.*\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|json|txt)$/i,
  ],

  // ✅ Minimal runtime caching (no invalid fields)
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 5,
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
    return base ? [{ source: "/api/:path*", destination: `${base}/api/:path*` }] : [];
  },
};

module.exports = withPWA(nextConfig);
