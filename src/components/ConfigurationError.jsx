import React from 'react';

const ConfigurationError = ({ error, title = "Configuration Error" }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
          
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700 mb-4">
              {error || "The application is not properly configured. This usually happens when environment variables are missing."}
            </p>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">To fix this issue:</h3>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <h4 className="font-medium text-blue-900 mb-2">For Vercel Deployment:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Go to your Vercel dashboard</li>
                  <li>Navigate to your project settings</li>
                  <li>Go to "Environment Variables"</li>
                  <li>Add the following variables:</li>
                </ol>
                <div className="mt-2 text-sm font-mono bg-blue-100 p-2 rounded">
                  VITE_SUPABASE_URL=your_supabase_project_url<br/>
                  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
                </div>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <h4 className="font-medium text-green-900 mb-2">For Local Development:</h4>
                <p className="text-sm text-green-800 mb-2">Create a <code className="bg-green-100 px-1 rounded">.env</code> file in your project root:</p>
                <div className="text-sm font-mono bg-green-100 p-2 rounded">
                  VITE_SUPABASE_URL=your_supabase_project_url<br/>
                  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => window.open('https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native', '_blank')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Supabase Docs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationError;
