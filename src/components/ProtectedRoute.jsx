import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
)

const UnauthorizedPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-4">
        You don't have permission to access this page.
      </p>
      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go Back
      </button>
    </div>
  </div>
)

export const ProtectedRoute = ({ children, requiredRole = null, fallback = null }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access if required
  if (requiredRole) {
    const userRole = user.user_metadata?.role || user.role || 'analyst'
    
    // Role hierarchy: admin > manager > analyst
    const roleHierarchy = {
      'analyst': 1,
      'manager': 2,
      'admin': 3
    }
    
    const userRoleLevel = roleHierarchy[userRole] || 0
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0
    
    if (userRoleLevel < requiredRoleLevel) {
      return fallback || <UnauthorizedPage />
    }
  }

  return children
}

// Specific role-based route components
export const AnalystRoute = ({ children }) => (
  <ProtectedRoute requiredRole="analyst">
    {children}
  </ProtectedRoute>
)

export const ManagerRoute = ({ children }) => (
  <ProtectedRoute requiredRole="manager">
    {children}
  </ProtectedRoute>
)

export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
)

// Route that requires at least manager level
export const ManagerOrHigherRoute = ({ children }) => (
  <ProtectedRoute requiredRole="manager">
    {children}
  </ProtectedRoute>
)

// Route that requires at least admin level
export const AdminOnlyRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
)
