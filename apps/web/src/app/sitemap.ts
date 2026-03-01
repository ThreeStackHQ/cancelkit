import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://cancelkit.threestack.io', lastModified: new Date() },
    { url: 'https://cancelkit.threestack.io/pricing', lastModified: new Date() },
  ]
}
