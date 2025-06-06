import type { CollectionConfig } from 'payload'

import { hasRole } from '@/access/hasRole'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: () => true,
    delete: hasRole(['admin']),
    read: ({ req }) => {
      if (!req.user) return false
      return req.user.role === 'admin' || req.user.collection === 'users'
    },
    update: hasRole(['admin']),
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        {
          label: 'Administrator',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
      access: {
        read: () => true,
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
  ],
  timestamps: true,
}
