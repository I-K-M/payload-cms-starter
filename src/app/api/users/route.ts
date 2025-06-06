import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { email, password, name } = await req.json()

    // check if user already exists
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    if (existingUser.docs.length > 0) {
      return NextResponse.json(
        { message: 'A user with this email already exists' },
        { status: 400 },
      )
    }

    // create new user with role 'user'
    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name,
        role: 'user',
      },
    })

    return NextResponse.json({ message: 'User created successfully', user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ message: 'Error creating user' }, { status: 500 })
  }
}
