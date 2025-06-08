import { Page, Post } from '@/payload-types'
import { getServerSideURL } from './getURL'
import { siteConfig } from '@/config/site'

type JSONLDProps = {
  doc: Partial<Page> | Partial<Post> | null
  type: 'page' | 'post'
}

export const generateJSONLD = ({ doc, type }: JSONLDProps) => {
  if (!doc) return null

  const baseURL = getServerSideURL()
  const url = `${baseURL}${Array.isArray(doc.slug) ? doc.slug.join('/') : '/'}`
  const title = doc.meta?.title || doc.title || siteConfig.name
  const description = doc.meta?.description || ''

  if (type === 'post') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: description,
      image:
        doc.meta?.image && typeof doc.meta.image !== 'string'
          ? `${baseURL}${doc.meta.image.url}`
          : undefined,
      datePublished: doc.publishedAt,
      dateModified: doc.updatedAt,
      author: {
        '@type': 'Organization',
        name: siteConfig.name,
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.name,
        logo: {
          '@type': 'ImageObject',
          url: `${baseURL}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: url,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${baseURL}/logo.png`,
      },
    },
  }
}
