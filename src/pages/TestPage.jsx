import React from 'react';

export default function TestPage() {
  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1a365d] mb-4">Test Page</h1>
        <p className="text-slate-600 text-lg">This is a test page to verify routing is working.</p>
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-[#1a365d] mb-4">Current URL Info</h2>
          <p className="text-sm text-slate-600">Current URL: {window.location.href}</p>
          <p className="text-sm text-slate-600">Pathname: {window.location.pathname}</p>
        </div>
      </div>
    </div>
  );
}
