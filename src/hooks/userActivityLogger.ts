import { PayloadRequest } from 'payload'

export const userActivityLogger = {
  afterChange: [
    async ({
      req,
      doc,
      operation,
    }: {
      req: PayloadRequest
      doc: any
      operation: 'create' | 'update'
    }) => {
      try {
        const { payload } = req
        const user = req.user

        if (!user) return

        await payload.create({
          collection: 'activity-logs',
          data: {
            action: operation,
            user: user.id,
            collectionName: 'users',
            documentId: doc.id,
            documentTitle: doc.email || 'Untitled',
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            details: `User ${operation === 'create' ? 'created' : 'updated'}`,
          },
        })
      } catch (error) {
        console.error('Error creating log:', error)
      }
    },
  ],
  afterDelete: [
    async ({ req, doc }: { req: PayloadRequest; doc: any }) => {
      try {
        const { payload } = req
        const user = req.user

        if (!user) return

        await payload.create({
          collection: 'activity-logs',
          data: {
            action: 'delete',
            user: user.id,
            collectionName: 'users',
            documentId: doc.id,
            documentTitle: doc.email || 'Untitled',
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            details: 'User deleted',
          },
        })
      } catch (error) {
        console.error('Error creating log:', error)
      }
    },
  ],
}
