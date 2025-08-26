# Deployment Setup Guide

## Fixing the White Screen Issue

The white screen issue on your Vercel deployment is caused by missing environment variables. Follow these steps to fix it:

### Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 2: Configure Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `eva-loan-ai` project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable Name | Value |
|---------------|-------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |

### Step 3: Redeploy

1. After adding the environment variables, go to **Deployments**
2. Click **Redeploy** on your latest deployment
3. Wait for the deployment to complete

### Step 4: Verify

1. Visit your deployed site: `https://eva-loan-ai.vercel.app/`
2. You should now see your application instead of a white screen

## Optional Environment Variables

You can also add these optional variables for additional features:

| Variable Name | Description |
|---------------|-------------|
| `VITE_APP_ENV` | Set to `production` for production environment |
| `VITE_API_BASE_URL` | Your API base URL (if different from default) |

## Troubleshooting

### Still seeing a white screen?

1. Check the browser console for errors
2. Verify your environment variables are correctly set in Vercel
3. Make sure your Supabase project is active and accessible
4. Try redeploying the application

### Environment variables not working?

1. Ensure variable names start with `VITE_` (required for Vite)
2. Check that there are no extra spaces in the values
3. Redeploy after adding environment variables

## Local Development

For local development, create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ENV=development
```

## Support

If you continue to have issues:
1. Check the browser console for specific error messages
2. Verify your Supabase project is properly configured
3. Ensure your Vercel deployment is using the latest code
