import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info?.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border max-w-md w-full p-6 text-center">
            <h1 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-slate-600 mb-4">
              The app hit an error. You can try refreshing the page. If it keeps happening, check the browser console (F12) for details.
            </p>
            {this.state.error && (
              <pre className="text-left text-sm text-red-700 bg-red-50 rounded-lg p-3 mb-4 overflow-auto max-h-32">
                {this.state.error?.message || String(this.state.error)}
              </pre>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
