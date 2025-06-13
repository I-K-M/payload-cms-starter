import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { hasRole } from '@/access/hasRole'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'
import { postActivityLogger } from '@/hooks/postActivityLogger'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  access: {
    create: hasRole(['admin', 'editor']),
    delete: hasRole(['admin']),
    read: authenticatedOrPublished,
    update: hasRole(['admin', 'editor']),
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'posts',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            {
              name: 'keywords',
              type: 'text',
              label: 'Keywords',
              admin: {
                description: 'Separate keywords with commas',
              },
            },
            {
              name: 'robots',
              type: 'group',
              label: 'Robots Directives',
              fields: [
                {
                  name: 'index',
                  type: 'checkbox',
                  label: 'Index page',
                  defaultValue: true,
                },
                {
                  name: 'follow',
                  type: 'checkbox',
                  label: 'Follow links',
                  defaultValue: true,
                },
                {
                  name: 'noimageindex',
                  type: 'checkbox',
                  label: 'Do not index images',
                  defaultValue: false,
                },
              ],
            },
            {
              name: 'social',
              type: 'group',
              label: 'Social Media',
              fields: [
                {
                  name: 'twitter',
                  type: 'group',
                  label: 'Twitter',
                  fields: [
                    {
                      name: 'card',
                      type: 'select',
                      label: 'Card Type',
                      options: [
                        { label: 'Summary', value: 'summary' },
                        { label: 'Summary Large Image', value: 'summary_large_image' },
                        { label: 'App', value: 'app' },
                        { label: 'Player', value: 'player' },
                      ],
                      defaultValue: 'summary_large_image',
                    },
                    {
                      name: 'creator',
                      type: 'text',
                      label: 'Twitter Handle',
                    },
                  ],
                },
                {
                  name: 'og',
                  type: 'group',
                  label: 'Open Graph',
                  fields: [
                    {
                      name: 'type',
                      type: 'select',
                      label: 'Type',
                      options: [
                        { label: 'Website', value: 'website' },
                        { label: 'Article', value: 'article' },
                        { label: 'Profile', value: 'profile' },
                        { label: 'Book', value: 'book' },
                      ],
                      defaultValue: 'article',
                    },
                    {
                      name: 'author',
                      type: 'text',
                      label: 'Author',
                    },
                    {
                      name: 'section',
                      type: 'text',
                      label: 'Section',
                    },
                    {
                      name: 'tags',
                      type: 'array',
                      label: 'Tags',
                      fields: [
                        {
                          name: 'tag',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidatePost, ...postActivityLogger.afterChange],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete, ...postActivityLogger.afterDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}

export { Posts }
