import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: number
      name: string
      username: string
      role: 'admin' | 'faculty' | 'staff'
      status: number
    }
  }

  interface User {
    id: number
    name: string
    username: string
    role: 'admin' | 'faculty' | 'staff'
    status: number
    accessToken: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: number
      name: string
      username: string
      role: 'admin' | 'faculty' | 'staff'
      status: number
    }
  }
}
