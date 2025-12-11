"use client"

import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // log to console so user/dev can copy the stack trace
    // avoid sending any network telemetry from this helper
    // keep non-sensitive logging only
    console.error('[ErrorBoundary] caught error:', error)
    console.error(info?.componentStack || '')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="max-w-2xl w-full bg-white/90 dark:bg-black/90 rounded-md p-6 shadow">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground">An unexpected error occurred while rendering the app. Check the browser console and the terminal running the dev server for details.</p>
            <details className="mt-4 whitespace-pre-wrap text-xs text-red-600">
              {String(this.state.error && (this.state.error.stack || this.state.error.message || this.state.error))}
            </details>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
