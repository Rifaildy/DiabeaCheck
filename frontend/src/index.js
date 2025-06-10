    "use client";

    import React from "react";
    import ReactDOM from "react-dom/client";
    import "./index.css";
    import App from "./App";
    import reportWebVitals from "./reportWebVitals";

    // Error boundary for better error handling
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true };
      }

      componentDidCatch(error, errorInfo) {
        this.setState({
          error: error,
          errorInfo: errorInfo,
        });

        // Log error to console in development
        if (process.env.NODE_ENV === "development") {
          console.error("Error caught by boundary:", error, errorInfo);
        }
      }

      render() {
        if (this.state.hasError) {
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Oops! Terjadi Kesalahan
                </h1>
                <p className="text-gray-600 mb-6">
                  Aplikasi mengalami masalah. Silakan refresh halaman atau
                  hubungi tim support.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Refresh Halaman
                </button>
                {process.env.NODE_ENV === "development" && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500">
                      Detail Error (Development)
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                      {this.state.error && this.state.error.toString()}
                      <br />
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          );
        }

        return this.props.children;
      }
    }

    const root = ReactDOM.createRoot(document.getElementById("root"));

    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );

    // Performance monitoring
    reportWebVitals(console.log);
