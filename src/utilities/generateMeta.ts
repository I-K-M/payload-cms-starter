import { Metadata } from 'next'
import { Page, Post } from '@/payload-types'
import { getImageURL } from './getImageURL'

const mergeOpenGraph = (og: any) => {
  return {
    ...og,
    type: og.type || 'website',
    siteName: og.siteName || 'Payload Website Template',
    locale: 'en_US',
  }
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)
  const title = doc?.meta?.title
    ? doc?.meta?.title + ' | Payload Website Template'
    : 'Payload Website Template'

  // Build robots directives
  const robots = doc?.meta?.robots
    ? {
        index: doc.meta.robots.index ?? true,
        follow: doc.meta.robots.follow ?? true,
        nocache: false,
        googleBot: {
          index: doc.meta.robots.index ?? true,
          follow: doc.meta.robots.follow ?? true,
          noimageindex: doc.meta.robots.noImageIndex ?? false,
        },
      }
    : undefined

  // Build Twitter metadata
  const twitter = doc?.meta?.social
    ? {
        card: doc.meta.social.twitterCard || 'summary_large_image',
        title,
        description: doc?.meta?.description || '',
        images: ogImage ? [ogImage] : undefined,
      }
    : undefined

  // Build Open Graph metadata
  const openGraph = mergeOpenGraph({
    title,
    description: doc?.meta?.description || '',
    url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    type: doc?.meta?.social?.ogType || 'website',
    siteName: doc?.meta?.social?.ogSiteName,
    publishedTime: doc?.meta?.social?.ogPublishedTime,
    modifiedTime: doc?.meta?.social?.ogModifiedTime,
    authors: doc?.meta?.social?.ogAuthor ? [doc.meta.social.ogAuthor] : undefined,
    section: doc?.meta?.social?.ogSection,
    tags: doc?.meta?.social?.ogTags,
    images: ogImage
      ? [
          {
            url: ogImage,
          },
        ]
      : undefined,
  })

  return {
    title,
    description: doc?.meta?.description || '',
    keywords: doc?.meta?.keywords,
    robots,
    twitter,
    openGraph,
  }
}
