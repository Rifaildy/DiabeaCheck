"use client"

import { useState } from "react"
import { checkHealth, testDatabase, register, login } from "../../services/api"

const ApiTest = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})

  const runTest = async (testName, testFunction, ...args) => {
    setLoading((prev) => ({ ...prev, [testName]: true }))
    try {
      const result = await testFunction(...args)
      setResults((prev) => ({ ...prev, [testName]: { success: true, data: result } }))
    } catch (error) {
      setResults((prev) => ({ ...prev, [testName]: { success: false, error: error.message } }))
    } finally {
      setLoading((prev) => ({ ...prev, [testName]: false }))
    }
  }

  const testData = {
    email: "test@example.com",
    password: "123456",
    name: "Test User",
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">API Connection Test</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Health Check */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Health Check</h3>
          <button
            onClick={() => runTest("health", checkHealth)}
            disabled={loading.health}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading.health ? "Testing..." : "Test Health"}
          </button>
          {results.health && (
            <div
              className={`mt-2 p-2 rounded text-sm ${results.health.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.health.success ? `✅ ${results.health.data.message}` : `❌ ${results.health.error}`}
            </div>
          )}
        </div>

        {/* Database Test */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Database Test</h3>
          <button
            onClick={() => runTest("database", testDatabase)}
            disabled={loading.database}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading.database ? "Testing..." : "Test Database"}
          </button>
          {results.database && (
            <div
              className={`mt-2 p-2 rounded text-sm ${results.database.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.database.success
                ? `✅ Database: ${results.database.data.database?.status || "Connected"}`
                : `❌ ${results.database.error}`}
            </div>
          )}
        </div>

        {/* Register Test */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Register Test</h3>
          <button
            onClick={() => runTest("register", register, testData)}
            disabled={loading.register}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading.register ? "Testing..." : "Test Register"}
          </button>
          {results.register && (
            <div
              className={`mt-2 p-2 rounded text-sm ${results.register.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.register.success ? `✅ User registered successfully` : `❌ ${results.register.error}`}
            </div>
          )}
        </div>

        {/* Login Test */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Login Test</h3>
          <button
            onClick={() => runTest("login", login, { email: testData.email, password: testData.password })}
            disabled={loading.login}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading.login ? "Testing..." : "Test Login"}
          </button>
          {results.login && (
            <div
              className={`mt-2 p-2 rounded text-sm ${results.login.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.login.success ? `✅ Login successful` : `❌ ${results.login.error}`}
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {Object.keys(results).length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results Summary</h3>
          <pre className="text-xs overflow-auto">{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default ApiTest
