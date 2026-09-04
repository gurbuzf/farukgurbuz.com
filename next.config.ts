import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Clickjacking protection
  { key: "X-Frame-Options", value: "DENY" },
  // XSS filter (legacy browsers)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Referrer policy for privacy + SEO link-juice
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Permissions policy (disable unused APIs)
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Strict Transport Security — forces HTTPS (1 year)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Enable gzip/brotli for faster page loads (Core Web Vitals signal)
  compress: true,

  // Enforce trailing slash consistency for canonical URLs
  trailingSlash: false,

  // Security + performance headers on every route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
