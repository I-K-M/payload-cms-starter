// resetAdminPassword.ts
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import payload from 'payload'
import config from './src/payload.config' // ← tu peux maintenant importer le fichier TS sans souci

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })

const ADMIN_EMAIL = 'ikm.frontend@gmail.com'
const ADMIN_PASSWORD = 'your_new_password_here' // change ici

const run = async () => {
  await payload.init({
    config,
    local: true,
  })

  try {
    const existing = await payload.find({
      collection: 'users',
      where: {
        email: { equals: ADMIN_EMAIL },
      },
    })

    if (existing.docs.length > 0) {
      const user = existing.docs[0]

      await payload.update({
        collection: 'users',
        id: user.id,
        data: { password: ADMIN_PASSWORD },
      })

      console.log(`✅ Mot de passe mis à jour pour ${user.email}`)
    } else {
      await payload.create({
        collection: 'users',
        data: {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          role: 'admin',
        },
      })

      console.log(`✅ Utilisateur créé : ${ADMIN_EMAIL}`)
    }
  } catch (err) {
    console.error('❌ Erreur :', err.message)
  }

  process.exit(0)
}

run()
