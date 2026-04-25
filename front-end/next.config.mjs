/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

// We must allow blob: for object-src because of the PDF viewer in docs-gallery
// We restrict connect-src to the API URL and WebSockets
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.cloudflareinsights.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://res.cloudinary.com;
  connect-src 'self' ${process.env.NEXT_PUBLIC_BASE_URL || ''} ws: wss: https://cloudflareinsights.com;
  font-src 'self' data:;
  frame-src 'none';
  object-src 'self' blob:;
  base-uri 'self';
  form-action 'self';
  ${!isDev ? 'upgrade-insecure-requests;' : ''}
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: cspHeader },
];

const nextConfig = {
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  output: 'standalone',
  compiler: {
    removeConsole: !isDev,
  },
  experimental: {
    optimizePackageImports: ['react-icons', 'lucide-react'],
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 'res.cloudinary.com',
            port: '',
        },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

