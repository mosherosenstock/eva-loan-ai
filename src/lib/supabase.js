import { createClient } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth Context
const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signUp = async (email, password, userData = {}) => {
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
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }

  const updatePassword = async (password) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  }

  const value = {
    user,
    loading,
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
      const { data, error } = await supabase
        .from('business_applications')
        .select('*')
        .order(sortBy, { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    },
    
    get: async (id) => {
      const { data, error } = await supabase
        .from('business_applications')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    
    create: async (applicationData) => {
      const { data, error } = await supabase
        .from('business_applications')
        .insert([applicationData])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (id, updates) => {
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
      const { data, error } = await supabase
        .from('ml_model_runs')
        .select('*')
        .order('run_timestamp', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    },
    
    create: async (runData) => {
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
      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single()
      
      if (error) throw error
      return data
    },
    
    create: async (sessionData) => {
      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .insert([sessionData])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (sessionId, updates) => {
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
      const { data, error } = await supabase
        .from('document_uploads')
        .select('*')
        .eq('application_id', applicationId)
        .order('upload_date', { ascending: false })
      
      if (error) throw error
      return data
    },
    
    create: async (documentData) => {
      const { data, error } = await supabase
        .from('document_uploads')
        .insert([documentData])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (id, updates) => {
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
