export const siteConfig = {
  name: 'IKM',
  description: 'IKM - Votre partenaire de confiance',
  url: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ogImage: '/og-image.jpg',
  email: 'ikm.com',
  links: {
    twitter: 'https://twitter.com/ikm',
    github: 'https://github.com/ikm',
  },
  creator: 'IKM',
  defaultLocale: 'fr',
  locales: ['fr', 'en'],
} as const
