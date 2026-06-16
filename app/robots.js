import { BRAND_NAME } from '@/lib/brand';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/api/',
      },
    ],
    sitemap: 'https://YOUR-VERCEL-DOMAIN.vercel.app/sitemap.xml',
  };
}
