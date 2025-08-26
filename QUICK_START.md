# EVA Loan Management System - Quick Start Guide

## 🚀 Getting Started with Production Deployment

This guide will help you get started with the production deployment of the EVA Loan Management System. Follow these steps to begin your journey from local development to production-ready deployment.

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- Git repository set up
- Access to create accounts on:
  - [Vercel](https://vercel.com)
  - [Supabase](https://supabase.com)
  - [Databricks](https://databricks.com) (optional for Phase 5)

## Phase 0.5: De-risking Foundation (Week 1)

### Step 1: Install Dependencies

```bash
# Install new production dependencies
npm install

# Verify installation
npm run dev
```

### Step 2: Set Up Supabase

#### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and API keys

#### 2.2 Apply Database Schema
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run the contents of `supabase/migrations/001_initial_schema.sql`

This includes:
- All application tables
- pgvector extension for RAG
- Row Level Security (RLS) policies
- Performance indexes

### Step 3: Configure Environment Variables

#### 3.1 Create Local Environment File
```bash
# Copy the example environment file
cp env.example .env.local
```

#### 3.2 Update .env.local with Your Values
```env
# Supabase Configuration (Public)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Vercel AI Gateway (Public)
VITE_VERCEL_AI_GATEWAY_URL=https://api.vercel.com/v1/ai

# Application Configuration
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000/api
```

### Step 4: Set Up Vercel

#### 4.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Install Vercel CLI: `npm i -g vercel`

#### 4.2 Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Select your account
# - Link to existing project: No
# - Project name: eva-loan-app (or your preferred name)
# - Directory: ./ (current directory)
# - Override settings: No
```

#### 4.3 Configure Server-side Environment Variables in Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add these server-only variables:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   VERCEL_AI_GATEWAY_TOKEN=your_gateway_token
   DATABRICKS_TOKEN=your_databricks_token (optional for Phase 0.5)
   ```

### Step 5: Test Phase 0.5 Deliverables

#### 5.1 Test Authentication
```bash
# Start development server
npm run dev

# Open http://localhost:5173
# Verify authentication is working
```

#### 5.2 Test Protected Route
- Navigate to `/business-applications`
- Verify it requires authentication
- Test with different user roles

#### 5.3 Test Data Migration
- Verify `BusinessApplications.list()` loads from Supabase
- Check that mock data fallback works if needed

#### 5.4 Test AI Gateway
- Go to AI Agent page
- Send a test message
- Verify it uses `/api/ai` proxy

#### 5.5 Test ML Predictions
- Create a test application
- Trigger ML prediction
- Verify stub ML predictions work

#### 5.6 Test RLS
- Create test users with different roles
- Verify access isolation works correctly

### Step 6: Deploy Updates

#### 6.1 Commit and Push Changes
```bash
git add .
git commit -m "Phase 0.5: De-risking foundation complete"
git push origin main
```

#### 6.2 Deploy to Production
```bash
# Deploy to production
vercel --prod
```

## Success Criteria for Phase 0.5

✅ **All 6 deliverables pass:**
- Supabase project created and schema applied
- Authentication working with protected routes
- BusinessApplications.list() migrated to Supabase
- AI Gateway proxy functional
- ML predictions with stub working
- RLS enabled and tested

✅ **No breaking changes to existing functionality**
✅ **Performance acceptable (< 2s response time)**
✅ **Ready to proceed to Phase 1**

## Next Steps

### If Phase 0.5 Succeeds:
Proceed to **Phase 1: Foundation & Infrastructure Setup** in the [DEPLOYMENT_ROADMAP.md](./DEPLOYMENT_ROADMAP.md)

### If Issues Arise:
1. Check the troubleshooting section below
2. Review error logs in browser console and Vercel dashboard
3. Verify all environment variables are set correctly
4. Test each component individually

## Troubleshooting

### Common Issues

**Supabase Connection Errors**
- Verify your Supabase URL and API keys
- Check that your database tables exist
- Ensure RLS policies are configured correctly

**Vercel Deployment Issues**
- Check build logs in Vercel dashboard
- Verify environment variables are set
- Ensure all dependencies are installed

**Authentication Issues**
- Check Supabase auth settings
- Verify redirect URLs are configured
- Test with different browsers

**AI Gateway Issues**
- Verify VERCEL_AI_GATEWAY_TOKEN is set in Vercel
- Check that /api/ai endpoint is accessible
- Test with simple prompts first

### Getting Help

1. Check the [DEPLOYMENT_ROADMAP.md](./DEPLOYMENT_ROADMAP.md) for detailed information
2. Review the [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for progress tracking
3. Check Vercel and Supabase documentation
4. Review error logs in browser console and Vercel dashboard

## Folder Structure

```
/api
  ai.js              # AI Gateway proxy
  ml-predict.js      # ML predictions with feature flag
/src
  lib/
    supabase.js      # Supabase client & auth
  components/
    ProtectedRoute.jsx # Role-based access control
  api/
    aiGateway.js     # Client-side AI calls
    mlService.js     # ML service integration
/supabase
  migrations/
    001_initial_schema.sql # Complete database schema
```

---

**Ready to start?** Begin with Step 1 and work through each step systematically. Phase 0.5 is designed to de-risk the deployment by testing core functionality before proceeding to the full production setup.
