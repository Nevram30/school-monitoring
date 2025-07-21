import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'

import * as yup from 'yup'
import authschema from '@/schema/auth.schema'

import { signJwtAccessToken } from './jwt'
import { User } from '../../server/db/models'

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        name: { label: 'Name', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any): Promise<any> {
        if (!credentials) {
          return null
        }

        const { name, password } = credentials

        try {
          // Validate form data with Yup schema
          authschema.validateSync({ name, password }, { abortEarly: false })

          // Find user by username (not name)
          const user = await User.findOne({
            where: { username: credentials.name },
          })

          if (!user) {
            throw new Error(
              JSON.stringify({
                success: false,
                error: {
                  general: 'Invalid name or password',
                },
              })
            )
          }

          if (!user.password) {
            throw new Error(
              JSON.stringify({
                success: false,
                error: {
                  general: 'Account exists but has no password set',
                },
              })
            )
          }

          // Check password - support both MD5 (legacy) and bcrypt
          let isPasswordValid = false;
          
          // First try MD5 (for seeded admin user)
          const md5Hash = crypto.createHash('md5').update(password).digest('hex');
          if (user.password === md5Hash) {
            isPasswordValid = true;
          } else {
            // If MD5 doesn't match, try bcrypt
            try {
              isPasswordValid = await bcrypt.compare(password, user.password);
            } catch (error) {
              // If bcrypt fails, password is invalid
              isPasswordValid = false;
            }
          }

          if (!isPasswordValid) {
            throw new Error(
              JSON.stringify({
                success: false,
                error: {
                  general: 'Invalid name or password',
                },
              })
            )
          }

          const { password: pass, ...userWithoutPass } = user.toJSON()

          const accessToken = signJwtAccessToken(userWithoutPass)

          return {
            ...userWithoutPass,
            accessToken,
          }
        } catch (error) {
          if (error instanceof yup.ValidationError) {
            let errors = {}
            error.inner.forEach((result) => {
              errors = { ...errors, [result.path as any]: result.message }
            })

            throw new Error(
              JSON.stringify({
                success: false,
                error: errors,
              })
            )
          }

          throw new Error(
            JSON.stringify({
              success: false,
              error: (error as Error).message,
              status: 500,
            })
          )
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Store user data in token
        token.user = {
          id: Number(user.id),
          name: user.name,
          username: user.username,
          role: user.role,
          status: Number(user.status)
        }
      }
      return token
    },
    async session({ session, token }) {
      // Pass user data from token to session
      if (token.user) {
        session.user = token.user as any
      }
      return session
    },
  },
}

// Export alias for backward compatibility
export const options = authOptions;

function findUser(object: Record<string, any>): any | null {
  for (const key in object) {
    if (key === 'user' && object.user && object.user.role) {
      return object[key]
    } else if (typeof object[key] === 'object') {
      const result = findUser(object[key])
      if (result) {
        return result
      }
    }
  }
  return null
}
