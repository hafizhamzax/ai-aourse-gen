import { BRAND_NAME } from '@/lib/brand';

export default function sitemap() {
  return [
    {
      url: 'https://coursebuildai.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://coursebuildai.vercel.app/dashboard',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://coursebuildai.vercel.app/dashboard/explore',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
