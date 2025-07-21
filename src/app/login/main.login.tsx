import { redirect } from 'next/navigation'
import LogInForm from './login.form'
import FullScreenLoader from '@/components/ui-components/loader.screen'

type MainContentProps = {
  status: 'authenticated' | 'unauthenticated' | 'loading'
  role: string
  isLoading?: boolean
}

const MainContent: React.FC<MainContentProps> = ({
  status,
  role,
  isLoading,
}) => {
  if (status === 'loading' || isLoading) {
    return (
      <div className="w-full flex items-center justify-center">
        <FullScreenLoader />
      </div>
    )
  }

const page = role === 'admin' ? 'admin' : role === 'faculty' ? 'faculty' : 'staff'

  if (status === 'authenticated') {
    redirect(`/${page}/dashboard`)
  }

  return (
    <div>
      <LogInForm />
    </div>
  )
}

export default MainContent
