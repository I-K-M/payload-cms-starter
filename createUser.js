import payload from 'payload'
import dotenv from 'dotenv'

dotenv.config()

const run = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    local: true,
  })

  try {
    const newUser = await payload.create({
      collection: 'users',
      data: {
        email: 'root@root.com',
        password: 'root',
        name: 'root',
        role: 'admin',
      },
    })

    console.log('✅ Utilisateur créé :', newUser)
  } catch (err) {
    console.error('❌ Erreur lors de la création de l’utilisateur :', err)
  }

  process.exit()
}

run()
