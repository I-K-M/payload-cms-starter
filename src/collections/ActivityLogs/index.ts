import type { CollectionConfig } from 'payload'
import { hasRole } from '@/access/hasRole'

const ActivityLogs: CollectionConfig = {
  slug: 'activity-logs',
  admin: {
    useAsTitle: 'details',
    defaultColumns: ['action', 'userNameAndId', 'collectionName', 'documentTitle', 'createdAt'],
    group: 'Admin',
    description: 'Updates and user actions logs',
  },
  access: {
    read: hasRole(['admin']),
    create: hasRole(['admin']),
    update: hasRole(['admin']),
    delete: hasRole(['admin']),
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Create', value: 'create' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' },
        { label: 'Login', value: 'login' },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'userNameAndId',
      type: 'text',
    },
    {
      name: 'collectionName',
      type: 'text',
      required: true,
    },
    {
      name: 'documentId',
      type: 'text',
      required: true,
    },
    {
      name: 'documentTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'ipAddress',
      type: 'text',
    },
    {
      name: 'details',
      type: 'text',
      required: true,
    },
  ],
  timestamps: true,
}

export { ActivityLogs }
