"use client"

import { useState } from "react"
import { checkHealth, testDatabase, register, login } from "../../services/api"

const ApiTest = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})

  const testEndpoint = async (name, testFunction, params = {}) => {
    setLoading((prev) => ({ ...prev, [name]: true }))
    try {
      const result = await testFunction(params)
      setResults((prev) => ({ ...prev, [name]: { success: true, data: result } }))
    } catch (error) {
      setResults((prev) => ({ ...prev, [name]: { success: false, error: error.message } }))
    } finally {
      setLoading((prev) => ({ ...prev, [name]: false }))
    }
  }

  const testData = {
    email: "test@example.com",
    password: "123456",
    name: "Test User",
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">API Connection Test</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="font-semibold">Frontend URL:</p>
          <p className="text-blue-600">https://diabea-check-5ok4.vercel.app</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">Backend URL:</p>
          <p className="text-green-600">https://apideabeacheck-153b.vercel.app</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Health Check */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Health Check</h3>
          <button
            onClick={() => testEndpoint("health", checkHealth)}
            disabled={loading.health}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading.health ? "Testing..." : "Test /health"}
          </button>
          {results.health && (
            <div
              className={`mt-2 p-2 rounded text-sm ${results.health.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.health.success ? "✅ Connected" : `❌ ${results.health.error}`}
            </div>
          )}
        </div>

        {/* Database Test */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Database Test</h3>
          <button
            onClick={() => testEndpoint("database", testDatabase)}
            disabled={loading.database}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading.database ? "Testing..." : "Test /api/health"}
          </button>
          {results.database && (
            <div
              className={`mt-2 p-2 rounded text-sm ${results.database.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.database.success ? "✅ DB Connected" : `❌ ${results.database.error}`}
            </div>
          )}
        </div>

        {/* Register Test */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Register Test</h3>
          <button
            onClick={() => testEndpoint("register", register, testData)}
            disabled={loading.register}
            className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading.register ? "Testing..." : "Test Register"}
          </button>
          {results.register && (
            <div
              className={`mt-2 p-2 rounded text-sm ${results.register.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.register.success ? "✅ Register OK" : `❌ ${results.register.error}`}
            </div>
          )}
        </div>

        {/* Login Test */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Login Test</h3>
          <button
            onClick={() => testEndpoint("login", login, { email: testData.email, password: testData.password })}
            disabled={loading.login}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading.login ? "Testing..." : "Test Login"}
          </button>
          {results.login && (
            <div
              className={`mt-2 p-2 rounded text-sm ${results.login.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.login.success ? "✅ Login OK" : `❌ ${results.login.error}`}
            </div>
          )}
        </div>
      </div>

      {/* Results Display */}
      {Object.keys(results).length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Detailed Results:</h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default ApiTest
