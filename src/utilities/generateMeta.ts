import { Metadata } from 'next'
import { Page, Post } from '@/payload-types'
import { getImageURL } from './getImageURL'
import { getServerSideURL } from './getURL'
import { generateJSONLD } from './generateJSONLD'
import { siteConfig } from '@/config/site'

type OpenGraphType = 'website' | 'article' | 'profile' | 'book'

const mergeOpenGraph = (og: Partial<Metadata['openGraph']>) => {
  const baseOg = {
    ...og,
    siteName: siteConfig.name,
    locale: siteConfig.defaultLocale,
  } as NonNullable<Metadata['openGraph']>

  if ('type' in baseOg) {
    baseOg.type = (baseOg.type as OpenGraphType) || 'website'
  }

  return baseOg
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  type?: 'page' | 'post'
}): Promise<Metadata> => {
  const { doc, type = 'page' } = args

  const baseURL = getServerSideURL()
  const url = `${baseURL}${Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/'}`
  const ogImage = getImageURL(doc?.meta?.image)
  const title = doc?.meta?.title ? doc?.meta?.title + ` | ${siteConfig.name}` : siteConfig.name

  // Build robots directives
  const robots = doc?.meta?.robots
    ? {
        index: doc.meta.robots.index ?? true,
        follow: doc.meta.robots.follow ?? true,
        nocache: false,
        googleBot: {
          index: doc.meta.robots.index ?? true,
          follow: doc.meta.robots.follow ?? true,
          noimageindex: doc.meta.robots.noimageindex ?? false,
        },
      }
    : undefined

  // Build Twitter metadata
  const twitter = doc?.meta?.social?.twitter
    ? {
        card: doc.meta.social.twitter.card || 'summary_large_image',
        title,
        description: doc?.meta?.description || '',
        images: ogImage ? [ogImage] : undefined,
        creator: siteConfig.creator,
      }
    : undefined

  // Build Open Graph metadata
  const openGraph = mergeOpenGraph({
    title,
    description: doc?.meta?.description || '',
    url,
    type: (doc?.meta?.social?.og?.type as OpenGraphType) || 'website',
    siteName: siteConfig.name,
    publishedTime: doc?.publishedAt || doc?.createdAt,
    modifiedTime: doc?.updatedAt,
    authors: doc?.meta?.social?.og?.author ? [doc.meta.social.og.author] : undefined,
    section: doc?.meta?.social?.og?.section,
    tags: doc?.meta?.social?.og?.tags?.map((tag) => tag.tag).filter(Boolean) as string[],
    images: ogImage
      ? [
          {
            url: ogImage,
          },
        ]
      : undefined,
  })

  // Generate JSON-LD
  const jsonLD = generateJSONLD({ doc, type })

  return {
    title,
    description: doc?.meta?.description || '',
    keywords: doc?.meta?.keywords,
    robots,
    twitter,
    openGraph,
    alternates: {
      canonical: url,
    },
    other: {
      'application/ld+json': JSON.stringify(jsonLD),
    },
  }
}
