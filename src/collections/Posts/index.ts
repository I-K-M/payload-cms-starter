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
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from '@/fields/slug'

export const Posts: CollectionConfig<'posts'> = {
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
    categories: true,
    meta: {
      image: true,
      description: true,
    },
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
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
          ],
          label: 'Meta',
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
                      label: 'Card type',
                      options: [
                        { label: 'Summary', value: 'summary' },
                        { label: 'Summary with large image', value: 'summary_large_image' },
                        { label: 'App', value: 'app' },
                        { label: 'Player', value: 'player' },
                      ],
                      defaultValue: 'summary_large_image',
                    },
                    {
                      name: 'creator',
                      type: 'text',
                      label: 'Creator @username',
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
                      label: 'Content type',
                      options: [
                        { label: 'Website', value: 'website' },
                        { label: 'Article', value: 'article' },
                        { label: 'Profile', value: 'profile' },
                        { label: 'Book', value: 'book' },
                      ],
                      defaultValue: 'article',
                    },
                    {
                      name: 'siteName',
                      type: 'text',
                      label: 'Site name',
                    },
                    {
                      name: 'publishedTime',
                      type: 'date',
                      label: 'Publication date',
                      admin: {
                        date: {
                          pickerAppearance: 'dayAndTime',
                        },
                      },
                    },
                    {
                      name: 'modifiedTime',
                      type: 'date',
                      label: 'Modification date',
                      admin: {
                        date: {
                          pickerAppearance: 'dayAndTime',
                        },
                      },
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
                      name: 'tag',
                      type: 'text',
                      label: 'Tags',
                      admin: {
                        description: 'Separate tags with commas',
                      },
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
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
