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
    sitemap: 'https://coursebuildai.vercel.app/sitemap.xml',
  };
}
