import payload from 'payload'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import config from './src/payload.config'

dotenv.config()

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const ADMIN_EMAIL = 'ikm.frontend@gmail.com'
const ADMIN_PASSWORD = 'your_new_password_here' // <-- Remplacez par votre mot de passe

const createAdmin = async () => {
  await payload.init({
    config,
  })

  try {
    // Check if user already exists
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: ADMIN_EMAIL,
        },
      },
    })

    if (existingUser.docs && existingUser.docs.length > 0 && existingUser.docs[0]) {
      // Update existing user
      await payload.update({
        collection: 'users',
        id: existingUser.docs[0].id,
        data: {
          password: ADMIN_PASSWORD,
          role: 'admin',
        },
      })
      console.log('User updated successfully')
    } else {
      // Create new user
      await payload.create({
        collection: 'users',
        data: {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          role: 'admin',
        },
      })
      console.log('User created successfully')
    }
  } catch (error) {
    console.error('Error:', error)
  }

  process.exit(0)
}

createAdmin()
