'use client'
import React, { useId, useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

type SignInFormData = {
  name: string
  password: string
}

const SignInForm: React.FC = () => {
  const ids: SignInFormData = {
    password: useId(),
    name: useId(),
  }

  const [formData, setFormData] = useState<SignInFormData>({
    name: '',
    password: '',
  })

  const [formError, setFormError] = useState<Partial<SignInFormData>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [loginError, setLoginError] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    const updatedFormData = {
      ...formData,
      [name]: value,
    }

    setIsTyping(
      updatedFormData.name.length > 0 || updatedFormData.password.length > 0
    )

    if (formError[name as keyof SignInFormData]) {
      setFormError((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  const OnSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault()

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await signIn('credentials', {
        redirect: false,
        ...formData,
      })

      if ((response as any).error) {
        const jsonError = JSON.parse((response as any).error)
        setErrorMessage(jsonError.error)
        setLoginError(true)
        return
      }

      setLoginError(false)
    } catch (error) {
      console.log(error)
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Social Login Options */}

      {/* Separator 
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>*/}

      <form className="space-y-4 lg:space-y-6" onSubmit={OnSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id={ids.name}
              type="text"
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          {formError.name && (
            <p className="mt-1 text-sm text-red-600">{formError.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id={ids.password}
              type={showPassword ? 'text' : 'password'}
              className="w-full pl-10 pr-10 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {formError.password && (
            <p className="mt-1 text-sm text-red-600">{formError.password}</p>
          )}
        </div>

        {loginError && (
          <div className="text-sm text-red-600 text-center">{errorMessage}</div>
        )}

        <div>
          <button
            type="submit"
            className="w-full py-3 lg:py-4 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm lg:text-base bg-blue-600 font-semibold text-white hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="flex justify-center gap-1 mt-6 lg:mt-8 text-xs lg:text-sm">
            <p>Don't have an account?</p>
            <Link href="/register" className="text-blue-600 hover:text-blue-500">Sign up</Link>
          </div>
        </div>

        <div className="text-center text-xs lg:text-sm">
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-500"
          >
            Forgot your password?
          </Link>
        </div>
      </form>
    </div>
  )
}

export default SignInForm
