import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider, useAuth } from '@/lib/supabase.jsx'
import { Analytics } from '@vercel/analytics/react'
import ConfigurationError from './components/ConfigurationError'

function AppContent() {
  const { error, loading } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  // Show configuration error if Supabase is not configured
  if (error) {
    return <ConfigurationError error={error} />
  }

  // Show main application
  return (
    <>
      <Pages />
      <Toaster />
      <Analytics />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App 