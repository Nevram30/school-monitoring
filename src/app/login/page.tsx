'use client'
import React from 'react'
import { useSession } from 'next-auth/react'
import MainLogin from './main.login'

const SignIn = () => {
  const session = useSession()
  const users = session.data?.user as any

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4'>
      {/* Header */}
      <div className='mb-8 text-center'>
        <h1 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-2'>
          Student Property Monitoring System
        </h1>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md border bg-white rounded-lg shadow-lg">
        <div className="flex border-b">
          <div className="flex-1 py-3 lg:py-4 px-4 lg:px-6 text-center font-medium text-lg lg:text-xl text-gray-900">
            Login
          </div>
        </div>
        <div className="p-4 lg:p-6">
          <MainLogin status={session.status} role={users?.role} />
        </div>
      </div>
    </div>
  )
}

export default SignIn
