"use client"

import { useState } from "react"

const ApiConnectionTest = () => {
  const [testResults, setTestResults] = useState({})
  const [testing, setTesting] = useState(false)

  const testEndpoint = async (name, url, options = {}) => {
    try {
      console.log(`Testing ${name}:`, url)
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      const data = await response.text()
      console.log(`${name} response:`, response.status, data)

      return {
        status: response.status,
        success: response.ok,
        data: data,
        error: null,
      }
    } catch (error) {
      console.error(`${name} error:`, error)
      return {
        status: "ERROR",
        success: false,
        data: null,
        error: error.message,
      }
    }
  }

  const runTests = async () => {
    setTesting(true)
    const results = {}

    // Test 1: Basic health check
    results.health = await testEndpoint("Health Check", "https://apideabeacheck-153b.vercel.app/health")

    // Test 2: API health check
    results.apiHealth = await testEndpoint("API Health", "https://apideabeacheck-153b.vercel.app/api/prediction/health")

    // Test 3: Test auth endpoint (should fail without token)
    results.authTest = await testEndpoint("Auth Test", "https://apideabeacheck-153b.vercel.app/api/auth/me")

    // Test 4: Test prediction endpoint (should fail without auth)
    results.predictionTest = await testEndpoint(
      "Prediction Test",
      "https://apideabeacheck-153b.vercel.app/api/prediction/diabetes",
      {
        method: "POST",
        body: JSON.stringify({
          age: 30,
          glucose: 100,
          bloodPressure: 80,
          bmi: 25,
        }),
      },
    )

    setTestResults(results)
    setTesting(false)
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">API Connection Test</h2>

      <button
        onClick={runTests}
        disabled={testing}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {testing ? "Testing..." : "Run API Tests"}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div className="mt-6 space-y-4">
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className="border rounded p-4">
              <h3 className="font-bold text-lg capitalize">{testName.replace(/([A-Z])/g, " $1")}</h3>
              <div className="mt-2">
                <span
                  className={`inline-block px-2 py-1 rounded text-sm ${
                    result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  Status: {result.status}
                </span>
              </div>

              {result.error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <strong>Error:</strong> {result.error}
                </div>
              )}

              {result.data && (
                <div className="mt-2">
                  <strong>Response:</strong>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                    {typeof result.data === "string" ? result.data : JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ApiConnectionTest
