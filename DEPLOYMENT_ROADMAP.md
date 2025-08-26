# EVA Loan Management System - Production Deployment Roadmap

## Executive Summary

This document outlines a comprehensive, staged approach to transition the EVA Loan Management System from its current mock-based architecture to a production-ready system deployed on Vercel with enterprise-grade integrations including Supabase (PostgreSQL/Auth), Vercel AI Gateway for LLM connections, and MLflow/Databricks for machine learning model management.

## Current Architecture Assessment

### Current State
- **Frontend**: React + Vite application with Tailwind CSS and shadcn/ui components
- **Data Layer**: Mock services and static data files
- **AI Integration**: Mock LLM responses via `InvokeLLM` function
- **Authentication**: None (mock user)
- **Database**: None (in-memory mock data)
- **ML Models**: Simulated scoring algorithms

### Key Components Identified
- AI Agent with RAG capabilities (`EnhancedChatInterface.jsx`)
- Business Application Management
- ML Risk Assessment and Scoring
- Document Upload and Processing
- Dashboard Analytics and Reporting

## Phase 0.5: De-risking Foundation (Week 1)

### 0.5.1 Supabase Project Setup & Migrations
```bash
# Create Supabase project and apply initial schema
# Run migration: supabase/migrations/001_initial_schema.sql
```

**Deliverables:**
- ✅ Supabase project created
- ✅ Database schema applied (including pgvector)
- ✅ RLS policies configured

### 0.5.2 Authentication & Protected Route
```javascript
// Wire Supabase Auth + single protected route
// Test with: /business-applications (protected)
```

**Deliverables:**
- ✅ Authentication working
- ✅ Protected route functional
- ✅ User session management

### 0.5.3 Data Migration - Single Read Path
```javascript
// Migrate: BusinessApplications.list() → Supabase
// Keep mock data as fallback
```

**Deliverables:**
- ✅ BusinessApplications.list() uses Supabase
- ✅ Mock data fallback maintained
- ✅ Data integrity verified

### 0.5.4 AI Gateway Proxy
```javascript
// Add /api/ai proxy → Vercel AI Gateway
// Update EnhancedChatInterface to use /api/ai
```

**Deliverables:**
- ✅ /api/ai endpoint functional
- ✅ EnhancedChatInterface uses real AI
- ✅ Server-side token security

### 0.5.5 ML Predictions with Feature Flag
```javascript
// Add /api/ml-predict with stub Databricks
// Feature flag: use_real_mlflow = false (default)
```

**Deliverables:**
- ✅ /api/ml-predict endpoint
- ✅ Stub ML predictions working
- ✅ Feature flag for real MLflow

### 0.5.6 RLS Testing
```sql
-- Enable RLS for business_applications
-- Test access isolation with different users
```

**Deliverables:**
- ✅ RLS enabled and tested
- ✅ Access isolation verified
- ✅ Multi-user testing complete

**Success Criteria for Phase 0.5:**
- All 6 deliverables pass
- No breaking changes to existing functionality
- Performance acceptable (< 2s response time)
- Ready to proceed to Phase 1

## Phase 1: Foundation & Infrastructure Setup (Week 2-3)

### 1.1 Vercel Project Setup
```bash
# Initialize Vercel project
npm install -g vercel
vercel login
vercel init eva-loan-production
```

### 1.2 Environment Configuration
Create `.env.local` and `.env.production`:
```env
# Supabase Configuration (Public)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Vercel AI Gateway (Public)
VITE_VERCEL_AI_GATEWAY_URL=https://api.vercel.com/v1/ai

# Application Configuration
VITE_APP_ENV=production
VITE_API_BASE_URL=https://your-app.vercel.app/api

# Server-only Environment Variables (set in Vercel dashboard)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# VERCEL_AI_GATEWAY_TOKEN=your_gateway_token
# MLFLOW_TRACKING_URI=your_mlflow_uri
# DATABRICKS_HOST=your_databricks_host
# DATABRICKS_TOKEN=your_databricks_token
```

### 1.3 Supabase Database Schema
Database schema is now in `supabase/migrations/001_initial_schema.sql` and includes:

- Users and Authentication tables
- Business Applications with ML scoring
- Application Decisions tracking
- ML Model Runs with MLflow integration
- AI Chat Sessions for conversation history
- Document Uploads with processing status
- **RAG Schema**: Document embeddings and application knowledge base with pgvector
- Row Level Security (RLS) policies
- Performance indexes including vector similarity search

### 1.4 Database Migration Scripts
Create `supabase/migrations/` directory with migration files.

## Phase 2: Authentication & User Management (Week 2-3)

### 2.1 Supabase Auth Integration
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth context and hooks
export const useAuth = () => {
  // Implementation for user authentication
}
```

### 2.2 Role-Based Access Control
- **Analyst**: View applications, generate reports, use AI assistant
- **Manager**: Approve/reject applications, view analytics, manage team
- **Admin**: System configuration, user management, ML model deployment

### 2.3 Protected Routes Implementation
```javascript
// src/components/ProtectedRoute.jsx
import { useAuth } from '@/lib/supabase'
import { Navigate } from 'react-router-dom'

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()
  
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/unauthorized" />
  
  return children
}
```

## Phase 3: Data Layer Migration (Week 3-4)

### 3.1 Supabase Client Integration
```javascript
// src/api/supabaseClient.js
import { supabase } from '@/lib/supabase'

export const BusinessApplicationAPI = {
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
  }
}
```

### 3.2 Real-time Subscriptions
```javascript
// src/hooks/useRealtimeData.js
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export const useRealtimeApplications = () => {
  const [applications, setApplications] = useState([])
  
  useEffect(() => {
    const subscription = supabase
      .channel('business_applications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'business_applications' },
        (payload) => {
          // Handle real-time updates
          console.log('Change received!', payload)
        }
      )
      .subscribe()
    
    return () => subscription.unsubscribe()
  }, [])
  
  return applications
}
```

## Phase 4: Vercel AI Gateway Integration (Week 4-5)

### 4.1 AI Gateway Configuration
```javascript
// Client-side calls to /api/ai proxy
export const InvokeLLM = async ({ prompt, model = 'gpt-4', temperature = 0.7 }) => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model,
        temperature
      })
    })

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.content
  } catch (error) {
    console.error('AI Gateway error:', error)
    throw new Error('Failed to get AI response')
  }
}

export const InvokeLLMWithRAG = async ({ prompt, context, model = 'gpt-4' }) => {
  const enhancedPrompt = `
    Context: ${JSON.stringify(context)}
    
    User Question: ${prompt}
    
    Please provide a comprehensive answer based on the context provided.
  `
  
  return await InvokeLLM({ prompt: enhancedPrompt, model })
}
```

### 4.2 RAG Implementation for AI Agent
```javascript
// src/api/ragService.js
import { supabase } from '@/lib/supabase'
import { InvokeLLMWithRAG } from './aiGateway'

export const RAGService = {
  searchApplications: async (query) => {
    const { data, error } = await supabase
      .from('business_applications')
      .select('*')
      .or(`company_name.ilike.%${query}%,industry.ilike.%${query}%`)
      .limit(10)
    
    if (error) throw error
    return data
  },
  
  getApplicationContext: async (applicationIds) => {
    const { data, error } = await supabase
      .from('business_applications')
      .select('*')
      .in('id', applicationIds)
    
    if (error) throw error
    return data
  },
  
  generateResponse: async (userQuery, applicationContext) => {
    return await InvokeLLMWithRAG({
      prompt: userQuery,
      context: applicationContext
    })
  }
}
```

## Phase 5: MLflow/Databricks Integration (Week 5-6)

### 5.1 MLflow Client Setup
```javascript
// src/api/mlflowClient.js
import { MlflowClient } from '@databricks/mlflow'

const mlflowClient = new MlflowClient({
  trackingUri: import.meta.env.MLFLOW_TRACKING_URI,
  registryUri: import.meta.env.MLFLOW_REGISTRY_URI
})

export const MLflowService = {
  predictRiskScore: async (applicationFeatures) => {
    try {
      const modelName = 'eva-loan-risk-model'
      const modelVersion = 'latest'
      
      const prediction = await mlflowClient.predict({
        modelName,
        modelVersion,
        data: applicationFeatures
      })
      
      return {
        score: prediction.score,
        recommendation: prediction.recommendation,
        confidence: prediction.confidence,
        factors: prediction.factors
      }
    } catch (error) {
      console.error('MLflow prediction error:', error)
      throw new Error('Failed to get ML prediction')
    }
  },
  
  logPrediction: async (applicationId, features, prediction) => {
    const run = await mlflowClient.startRun({
      experimentName: 'eva-loan-predictions'
    })
    
    await mlflowClient.logParams(run.info.run_id, {
      application_id: applicationId,
      model_version: 'latest'
    })
    
    await mlflowClient.logMetrics(run.info.run_id, {
      prediction_score: prediction.score,
      confidence_score: prediction.confidence
    })
    
    await mlflowClient.endRun(run.info.run_id)
    
    return run.info.run_id
  }
}
```

### 5.2 ML Model Integration
```javascript
// src/api/mlService.js
import { MLflowService } from './mlflowClient'
import { supabase } from '@/lib/supabase'

export const MLService = {
  calculateRiskScore: async (applicationId) => {
    // Get application data
    const { data: application } = await supabase
      .from('business_applications')
      .select('*')
      .eq('id', applicationId)
      .single()
    
    // Prepare features for ML model
    const features = {
      sugef_rating: application.sugef_rating,
      amount_requested: application.amount_requested,
      years_in_business: application.years_in_business,
      number_of_employees: application.number_of_employees,
      new_business: application.new_business,
      jobs_to_create: application.jobs_to_create,
      industry: application.industry
    }
    
    // Get ML prediction
    const prediction = await MLflowService.predictRiskScore(features)
    
    // Log prediction to MLflow
    const runId = await MLflowService.logPrediction(applicationId, features, prediction)
    
    // Update application with ML results
    const { data: updatedApp } = await supabase
      .from('business_applications')
      .update({
        ml_score: prediction.score,
        ml_recommendation: prediction.recommendation,
        risk_level: prediction.confidence > 0.8 ? 'High' : prediction.confidence > 0.6 ? 'Medium' : 'Low'
      })
      .eq('id', applicationId)
      .select()
      .single()
    
    // Store ML run details
    await supabase
      .from('ml_model_runs')
      .insert({
        application_id: applicationId,
        model_version: 'latest',
        input_features: features,
        prediction_score: prediction.score,
        prediction_recommendation: prediction.recommendation,
        confidence_score: prediction.confidence,
        mlflow_run_id: runId
      })
    
    return updatedApp
  },
  
  batchProcessApplications: async (applicationIds) => {
    const results = []
    for (const appId of applicationIds) {
      try {
        const result = await MLService.calculateRiskScore(appId)
        results.push({ appId, success: true, result })
      } catch (error) {
        results.push({ appId, success: false, error: error.message })
      }
    }
    return results
  }
}
```

## Phase 6: Production Deployment & Optimization (Week 6-7)

### 6.1 Vercel Deployment Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/**.js": { "runtime": "nodejs20.x" }
  }
}
```

### 6.2 API Routes for Serverless Functions
```javascript
// api/ai.js - AI Gateway proxy
// api/ml-predict.js - ML predictions with feature flag
// Both use server-side environment variables for security
```

### 6.3 Performance Optimization
- **Code Splitting**: Implement React.lazy() for route-based splitting
- **Image Optimization**: Use Vercel's image optimization
- **Caching Strategy**: Implement Redis caching for frequently accessed data
- **CDN**: Configure Vercel's edge network for global performance

### 6.4 Monitoring & Analytics
```javascript
// src/lib/analytics.js
import { Analytics } from '@vercel/analytics/react'

export const trackEvent = (eventName, properties = {}) => {
  if (typeof window !== 'undefined') {
    Analytics.track(eventName, properties)
  }
}

export const trackPageView = (pageName) => {
  trackEvent('page_view', { page: pageName })
}

export const trackMLPrediction = (applicationId, prediction) => {
  trackEvent('ml_prediction', {
    application_id: applicationId,
    score: prediction.score,
    recommendation: prediction.recommendation
  })
}
```

## Phase 7: Testing & Quality Assurance (Week 7-8)

### 7.1 Automated Testing Suite
```javascript
// tests/integration/mlService.test.js
import { MLService } from '../../src/api/mlService'
import { supabase } from '../../src/lib/supabase'

describe('MLService Integration Tests', () => {
  test('should calculate risk score for application', async () => {
    const mockApplication = {
      id: 'test-app-1',
      sugef_rating: 'A1',
      amount_requested: 500000,
      years_in_business: 5,
      number_of_employees: 50,
      new_business: false,
      jobs_to_create: 10,
      industry: 'Technology'
    }
    
    const result = await MLService.calculateRiskScore(mockApplication.id)
    
    expect(result.ml_score).toBeGreaterThan(0)
    expect(result.ml_score).toBeLessThanOrEqual(100)
    expect(['APPROVE', 'REVIEW', 'DENY']).toContain(result.ml_recommendation)
  })
})
```

### 7.2 Load Testing
- **Artillery.js** for API endpoint testing
- **k6** for comprehensive load testing
- **Vercel Analytics** for real user monitoring

### 7.3 Security Testing
- **OWASP ZAP** for vulnerability scanning
- **Snyk** for dependency vulnerability checks
- **Supabase RLS** policies validation

## Phase 8: Go-Live & Maintenance (Week 8+)

### 8.1 Production Checklist
- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates verified
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented
- [ ] Team training completed

### 8.2 Post-Deployment Monitoring
- **Application Performance**: Vercel Analytics
- **Database Performance**: Supabase Dashboard
- **ML Model Performance**: MLflow Tracking
- **Error Tracking**: Sentry integration
- **User Analytics**: Google Analytics 4

### 8.3 Maintenance Schedule
- **Weekly**: Security updates and dependency checks
- **Monthly**: Performance review and optimization
- **Quarterly**: ML model retraining and validation
- **Annually**: Architecture review and planning

## Risk Mitigation & Contingency Plans

### High-Risk Scenarios
1. **ML Model Performance Degradation**
   - Fallback to rule-based scoring
   - A/B testing framework for model comparison
   - Automated alerting for prediction drift

2. **Database Performance Issues**
   - Read replicas for scaling
   - Query optimization and indexing
   - Connection pooling configuration

3. **AI Gateway Failures**
   - Circuit breaker pattern implementation
   - Fallback to cached responses
   - Graceful degradation of AI features

### Rollback Strategy
- **Feature Flags**: Implement feature toggles for gradual rollout
- **Database Rollback**: Maintain migration scripts for rollback
- **Blue-Green Deployment**: Zero-downtime deployment strategy

## Success Metrics & KPIs

### Technical Metrics
- **Response Time**: < 200ms for API calls
- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%
- **ML Prediction Accuracy**: > 85%

### Business Metrics
- **Application Processing Time**: 50% reduction
- **User Satisfaction**: > 4.5/5
- **System Adoption**: > 90% of target users
- **Cost Efficiency**: 30% reduction in manual processing

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| 0.5 | Week 1 | Supabase setup, Auth, Data migration, AI Gateway proxy, ML stub |
| 1 | Week 2-3 | Infrastructure setup, Supabase schema |
| 2 | Week 2-3 | Authentication, RBAC implementation |
| 3 | Week 3-4 | Data layer migration, real-time features |
| 4 | Week 4-5 | AI Gateway integration, RAG implementation |
| 5 | Week 5-6 | MLflow integration, model deployment |
| 6 | Week 6-7 | Production deployment, optimization |
| 7 | Week 7-8 | Testing, QA, security validation |
| 8 | Week 8+ | Go-live, monitoring, maintenance |

## Conclusion

This roadmap provides a comprehensive, staged approach to transitioning the EVA Loan Management System to a production-ready architecture. Each phase builds upon the previous one, ensuring a smooth transition while maintaining system stability and user experience.

The final architecture will provide:
- **Scalability**: Cloud-native deployment on Vercel
- **Reliability**: Supabase for data persistence and real-time features
- **Intelligence**: AI-powered insights via Vercel AI Gateway
- **Analytics**: ML-driven risk assessment via MLflow/Databricks
- **Security**: Enterprise-grade authentication and authorization
- **Performance**: Optimized for speed and user experience

Regular reviews and adjustments to this roadmap will ensure successful delivery and long-term system success.
