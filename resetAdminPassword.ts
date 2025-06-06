// resetAdminPassword.ts
import payload from 'payload'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import config from './src/payload.config'
import type { User } from './src/payload-types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Charger le .env depuis le répertoire racine
dotenv.config({ path: path.resolve(__dirname, '.env') })

// Afficher les variables d'environnement pour le débogage
console.log("🔍 Variables d'environnement :")
console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? '✅ Défini' : '❌ Non défini')
console.log('DATABASE_URI:', process.env.DATABASE_URI ? '✅ Défini' : '❌ Non défini')

if (!process.env.PAYLOAD_SECRET) {
  console.error('❌ PAYLOAD_SECRET est requis dans le fichier .env')
  process.exit(1)
}

const ADMIN_EMAIL = 'ikm.frontend@gmail.com'
const ADMIN_PASSWORD = 'toto12345'

const run = async () => {
  try {
    console.log('🔄 Initialisation de Payload...')
    const payloadConfig = {
      ...config,
      secret: process.env.PAYLOAD_SECRET,
    }

    await payload.init({
      config: payloadConfig,
    })

    console.log("🔍 Recherche de l'utilisateur existant...")
    const existing = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: ADMIN_EMAIL,
        },
      },
    })

    if (existing.docs.length > 0) {
      const user = existing.docs[0] as User
      if (!user) {
        throw new Error('Utilisateur non trouvé')
      }

      console.log(`📝 Mise à jour du mot de passe pour ${user.email}...`)

      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          password: ADMIN_PASSWORD,
          role: 'admin',
        },
      })

      console.log(`✅ Mot de passe mis à jour pour ${user.email}`)
    } else {
      console.log("📝 Création d'un nouvel utilisateur admin...")
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
    console.error('❌ Erreur :', err instanceof Error ? err.message : 'Une erreur est survenue')
    if (err instanceof Error) {
      console.error('Stack trace:', err.stack)
    }
  }

  process.exit(0)
}

run()
