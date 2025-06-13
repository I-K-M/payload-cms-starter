import { PayloadRequest } from 'payload'

export const pageActivityLogger = {
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
            collectionName: 'pages',
            documentId: doc.id,
            documentTitle: doc.title || 'Untitled',
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            details: `Page ${operation === 'create' ? 'created' : 'updated'}`,
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
            collectionName: 'pages',
            documentId: doc.id,
            documentTitle: doc.title || 'Untitled',
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            details: 'Page deleted',
          },
        })
      } catch (error) {
        console.error('Error creating log:', error)
      }
    },
  ],
}
