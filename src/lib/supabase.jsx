import { createClient } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Improved error handling for missing environment variables
const handleMissingEnvVars = () => {
  const missingVars = []
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY')
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}. Please configure these in your Vercel deployment settings.`
    console.error(errorMessage)
    
    // In development, throw error to help with debugging
    if (import.meta.env.DEV) {
      throw new Error(errorMessage)
    }
    
    // In production, return null to allow graceful degradation
    return null
  }
  
  return true
}

// Check environment variables before creating client
const envCheck = handleMissingEnvVars()

// Create Supabase client only if environment variables are available
export const supabase = envCheck ? createClient(supabaseUrl, supabaseAnonKey) : null

// Auth Context
const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // If Supabase is not configured, show error state
    if (!supabase) {
      setError('Supabase is not configured. Please check your environment variables.')
      setLoading(false)
      return
    }

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (err) {
        console.error('Error getting session:', err)
        setError('Failed to initialize authentication')
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase is not configured' } }
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signUp = async (email, password, userData = {}) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase is not configured' } }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    if (!supabase) {
      return { error: { message: 'Supabase is not configured' } }
    }
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase is not configured' } }
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }

  const updatePassword = async (password) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase is not configured' } }
    }
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  }

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Database helper functions
export const db = {
  // Business Applications
  applications: {
    list: async (sortBy = 'created_date', limit = 500) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('business_applications')
        .select('*')
        .order(sortBy, { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    },
    
    get: async (id) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('business_applications')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    
    create: async (applicationData) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('business_applications')
        .insert([applicationData])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (id, updates) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('business_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    delete: async (id) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { error } = await supabase
        .from('business_applications')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    }
  },
  
  // Application Decisions
  decisions: {
    list: async (limit = 100) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('application_decisions')
        .select(`
          *,
          business_applications (
            id,
            company_name,
            application_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    },
    
    create: async (decisionData) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('application_decisions')
        .insert([decisionData])
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },
  
  // ML Model Runs
  mlRuns: {
    list: async (limit = 100) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('ml_model_runs')
        .select('*')
        .order('run_timestamp', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    },
    
    create: async (runData) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('ml_model_runs')
        .insert([runData])
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },
  
  // AI Chat Sessions
  chatSessions: {
    get: async (sessionId) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single()
      
      if (error) throw error
      return data
    },
    
    create: async (sessionData) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .insert([sessionData])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (sessionId, updates) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .update(updates)
        .eq('session_id', sessionId)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },
  
  // Document Uploads
  documents: {
    list: async (applicationId) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('document_uploads')
        .select('*')
        .eq('application_id', applicationId)
        .order('upload_date', { ascending: false })
      
      if (error) throw error
      return data
    },
    
    create: async (documentData) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('document_uploads')
        .insert([documentData])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (id, updates) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('document_uploads')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  }
}

// Real-time subscriptions
export const useRealtimeData = (table, callback) => {
  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase client not initialized, cannot subscribe to realtime data.')
      return
    }

    const subscription = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()
    
    return () => subscription.unsubscribe()
  }, [table, callback])
}
