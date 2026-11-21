import type { NextConfig } from "next";

/**
 * Redirects for every address that changes from the old Nitienaa site. Add one line per old URL:
 *   { source: "/old-page", destination: "/nitienaa/new-page", permanent: true }
 * permanent: true sends a 308, which keeps search rankings.
 */
const OLD_SITE_REDIRECTS: { source: string; destination: string; permanent: boolean }[] = [
  // { source: "/about-me", destination: "/nitienaa/about", permanent: true },
  // { source: "/blog/:slug", destination: "/nitienaa/blog/:slug", permanent: true },
];

/** When the coach's own domain points here (COACH_DOMAIN=www.nitienaa.com), serve the coach site at its root. */
const coachDomain = process.env.COACH_DOMAIN;

const nextConfig: NextConfig = {
  // Lets a second dev server (e.g. an automated test run) use its own build folder instead of corrupting .next
  distDir: process.env.NEXT_DIST_DIR || ".next",

  async redirects() {
    return OLD_SITE_REDIRECTS;
  },

  async rewrites() {
    if (!coachDomain) return [];
    return {
      beforeFiles: [
        {
          source: "/:path((?!api|portal|web|_next|nitienaa|favicon\\.ico|tagmango|downloads|blog-images).*)",
          has: [{ type: "host", value: coachDomain }],
          destination: "/nitienaa/:path",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
