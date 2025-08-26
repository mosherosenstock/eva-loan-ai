import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
              <h2 className="text-lg font-semibold text-red-700 mb-2">Error Details:</h2>
              <pre className="text-sm text-red-600 bg-red-50 p-4 rounded overflow-auto">
                {this.state.error && this.state.error.toString()}
              </pre>
              <h3 className="text-md font-semibold text-red-700 mt-4 mb-2">Component Stack:</h3>
              <pre className="text-sm text-red-600 bg-red-50 p-4 rounded overflow-auto">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
