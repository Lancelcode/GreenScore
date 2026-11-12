import type { NextConfig } from 'next';

/**
 * Old PHP URLs → new routes. Bookmarks, printed certificates and links shared
 * before the TypeScript port keep working through permanent (308) redirects.
 */
const legacyRoutes: Record<string, string> = {
  '/index.php': '/',
  '/pages/auth/login.php': '/login',
  '/pages/auth/register.php': '/register',
  '/pages/auth/forgot_password.php': '/forgot-password',
  '/pages/calculator/green_calculator.php': '/calculator',
  '/pages/calculator/certificate_history.php': '/certificates',
  '/pages/calculator/buy_points.php': '/buy-points',
  '/pages/community/community.php': '/community',
  '/pages/user/my_impact.php': '/impact',
  '/pages/user/user_account.php': '/account',
  '/pages/user/view_cards.php': '/account/cards',
  '/pages/info/feedback.php': '/feedback',
  '/pages/info/about.php': '/about',
  '/pages/info/partner.php': '/partners',
  '/pages/info/green_resources.php': '/resources',
  '/pages/info/privacy.php': '/privacy',
  '/pages/info/terms.php': '/terms',
  '/pages/info/greenscore_copyright.php': '/copyright',
  '/pages/admin/manage_users.php': '/admin/users',
  '/pages/admin/admin_feedback.php': '/admin/feedback',
  '/pages/admin/public_feedback.php': '/admin/public-feedback',
  '/health.php': '/health',
};

const securityHeaders = [
  // Pages may not be framed by other sites (clickjacking).
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
];

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image.
  output: 'standalone',
  poweredByHeader: false,
  // Loaded from node_modules at run time instead of being bundled, so the
  // standalone server ships them and scripts/create-admin.mts can use them too.
  serverExternalPackages: ['mysql2', 'bcryptjs'],
  // Photos are served as-is from /public, so the image optimiser (and the
  // ~45 MB "sharp" library behind it) is left out of the Docker image.
  images: { unoptimized: true },
  outputFileTracingExcludes: { '*': ['node_modules/sharp/**', 'node_modules/@img/**'] },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },

  async redirects() {
    return [
      // Certificates and user edit pages carried their id in the query string.
      {
        source: '/pages/calculator/certificate_preview.php',
        has: [{ type: 'query', key: 'id', value: '(?<id>\\d+)' }],
        destination: '/certificates/:id',
        permanent: true,
      },
      { source: '/pages/calculator/certificate_preview.php', destination: '/certificates', permanent: true },
      {
        source: '/pages/admin/edit_user.php',
        has: [{ type: 'query', key: 'id', value: '(?<id>\\d+)' }],
        destination: '/admin/users/:id',
        permanent: true,
      },
      ...Object.entries(legacyRoutes).map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },
};

export default nextConfig;
