import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { User } from '@/payload-types'

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { email, password, name } = await req.json()

    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })
    if (existingUser.docs.length > 0) {
      const user = existingUser.docs[0] as User
      return NextResponse.json(
        { message: 'User already exists please login', user: user },
        { status: 409 },
      )
    }
    {
      /* if user already exists, update password
    if (existingUser.docs.length > 0) {
      const user = existingUser.docs[0] as User

      if (!user.id) {
        throw new Error('User ID not found')
      }

      console.log(`📝 Updating password for ${user.email}...`)

      const updated = await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          password: password,
          role: 'admin',
        },
      })

      return NextResponse.json({ message: 'Password updated', user: updated }, { status: 200 })
    } 
    */
    }

    const newUser = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name,
        role: 'user',
      },
    })

    return NextResponse.json(
      { message: 'User created successfully', user: newUser },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating/updating user:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
