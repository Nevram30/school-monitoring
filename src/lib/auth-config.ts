import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { JWT } from 'next-auth/jwt'
import { Session } from 'next-auth'
import { User } from '@/models'
import { verifyMD5Password, comparePassword } from '@/lib/auth'
import sequelize from '@/lib/database'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      username: string
      type: number
    }
  }

  interface User {
    id: string
    name: string
    username: string
    type: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    type: number
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          await sequelize.authenticate()
          
          // Find user by username
          const user = await User.findOne({
            where: { 
              username: credentials.username, 
              status: 1 
            }
          })

          if (!user) {
            return null
          }

          // Verify password (support both bcrypt and MD5 for compatibility)
          let isValidPassword = false;
          
          // Try bcrypt first (for new users)
          if (user.password.startsWith('$2')) {
            isValidPassword = await comparePassword(credentials.password, user.password);
          } else {
            // Fall back to MD5 for legacy users
            isValidPassword = verifyMD5Password(credentials.password, user.password);
          }

          if (!isValidPassword) {
            return null
          }

          // Return user object that will be stored in the session
          return {
            id: user.id.toString(),
            name: user.name,
            username: user.username,
            type: user.type,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      // Persist user data in the token
      if (user) {
        token.id = user.id
        token.username = user.username
        token.type = user.type
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.type = token.type
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET || 'fMyZXz7KWRR3CiY/PY+Cqn8TGBRUhx9iotIql9MhtYE=',
}

export default NextAuth(authOptions)
