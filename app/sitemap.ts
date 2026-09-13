import type { MetadataRoute } from 'next';
import { tools } from '@/data/tools';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/about`, priority: 0.5 },
  ];

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${SITE_URL}/${tool.slug}`,
    priority: 0.8,
  }));

  return [...staticPages, ...toolPages];
}
