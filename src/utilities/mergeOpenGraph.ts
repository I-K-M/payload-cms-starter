import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'
import { siteConfig } from '@/config/site'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: siteConfig.description,
  images: [
    {
      url: `${getServerSideURL()}${siteConfig.ogImage}`,
    },
  ],
  siteName: siteConfig.name,
  title: siteConfig.name,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
