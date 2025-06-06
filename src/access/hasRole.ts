import { Access } from 'payload'

export const hasRole = (roles: string[]): Access => {
  return ({ req }) => {
    const user = req?.user
    return Boolean(user && roles.includes(user.role))
  }
}
