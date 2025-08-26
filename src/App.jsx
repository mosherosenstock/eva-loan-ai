import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/lib/supabase'
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <AuthProvider>
      <Pages />
      <Toaster />
      <Analytics />
    </AuthProvider>
  )
}

export default App 