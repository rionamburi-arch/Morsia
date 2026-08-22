const isDev = process.env.NODE_ENV !== 'production';

// 'unsafe-inline' for scripts is required by Next's inline bootstrap in this
// setup; tighten to a nonce later if the build allows. 'unsafe-eval' and the
// ws: sources are dev-only (HMR).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com https://www.clarity.ms https://*.clarity.ms`,
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self' https://va.vercel-scripts.com https://*.clarity.ms https://c.bing.com${isDev ? ' ws:' : ''}`,
  "img-src 'self' data: https://*.clarity.ms",
  "font-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
