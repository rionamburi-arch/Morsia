const isDev = process.env.NODE_ENV !== 'production';

// 'unsafe-inline' for scripts is required by Next's inline bootstrap in this
// setup; tighten to a nonce later if the build allows. 'unsafe-eval' and the
// ws: sources are dev-only (HMR).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com${isDev ? ' ws://localhost:* ws://127.0.0.1:*' : ''}`,
  "img-src 'self' data:",
  "font-src 'self'",
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
