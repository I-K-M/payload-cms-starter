import { PayloadRequest } from 'payload'

export const loginLogger = {
  afterLogin: [
    async ({ req, user }: { req: PayloadRequest; user: any }) => {
      try {
        const { payload } = req

        await payload.create({
          collection: 'activity-logs',
          data: {
            action: 'login',
            user: user.id,
            userNameAndId: `${user.name || 'Unknown user'} - ID: ${user.id}`,
            collectionName: 'users',
            documentId: user.id,
            documentTitle: user.email,
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            details: 'Login successful',
          },
        })
      } catch (error) {
        console.error('Error creating login log:', error)
      }
    },
  ],
}
