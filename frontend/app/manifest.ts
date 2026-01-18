import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Storyverrse",
    short_name: "Storyverrse",

    // ✅ VERY IMPORTANT: PWA install signal
    start_url: "/?source=pwa",
    scope: "/",

    // ✅ MUST be standalone (tab me nahi, app ki tarah)
    display: "standalone",

    background_color: "#0b1220",
    theme_color: "#16a34a",

    // ✅ Chrome ko shortcut vs app ka difference samajhne me madad
    prefer_related_applications: false,

    icons: [
      {
        src: "/icon-192-v2.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512-v2.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}
