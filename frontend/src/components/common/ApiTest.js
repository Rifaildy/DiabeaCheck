"use client"

import { useState } from "react"
import { checkHealth, register, login, getProfile } from "../../services/api"

const ApiTest = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})
  const [testData, setTestData] = useState({
    email: "test@example.com",
    password: "123456",
    name: "Test User",
  })

  const testEndpoint = async (name, testFunction) => {
    setLoading((prev) => ({ ...prev, [name]: true }))
    try {
      const result = await testFunction()
      setResults((prev) => ({ ...prev, [name]: { success: true, data: result } }))
    } catch (error) {
      setResults((prev) => ({ ...prev, [name]: { success: false, error: error.message } }))
    } finally {
      setLoading((prev) => ({ ...prev, [name]: false }))
    }
  }

  const tests = [
    {
      name: "Health Check",
      key: "health",
      test: () => checkHealth(),
    },
    {
      name: "Register Test",
      key: "register",
      test: () => register(testData),
    },
    {
      name: "Login Test",
      key: "login",
      test: () => login({ email: testData.email, password: testData.password }),
    },
    {
      name: "Get Profile (/auth/me)",
      key: "profile",
      test: () => getProfile(),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">API Connection Test</h1>

      {/* Test Data Configuration */}
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-4">Test Data Configuration:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email:</label>
            <input
              type="email"
              value={testData.email}
              onChange={(e) => setTestData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password:</label>
            <input
              type="password"
              value={testData.password}
              onChange={(e) => setTestData((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name:</label>
            <input
              type="text"
              value={testData.name}
              onChange={(e) => setTestData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {tests.map((test) => (
          <div key={test.key} className="border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{test.name}</h2>
              <button
                onClick={() => testEndpoint(test.key, test.test)}
                disabled={loading[test.key]}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading[test.key] ? "Testing..." : "Test"}
              </button>
            </div>

            {results[test.key] && (
              <div className="mt-4">
                <div
                  className={`p-4 rounded ${
                    results[test.key].success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  <h3 className="font-semibold mb-2">{results[test.key].success ? "✅ Success" : "❌ Error"}</h3>
                  <pre className="text-sm overflow-auto max-h-64">
                    {JSON.stringify(
                      results[test.key].success ? results[test.key].data : results[test.key].error,
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Expected URLs:</h3>
        <ul className="text-sm space-y-1">
          <li>Health: https://apideabeacheck-153b.vercel.app/health</li>
          <li>Register: https://apideabeacheck-153b.vercel.app/api/auth/register</li>
          <li>Login: https://apideabeacheck-153b.vercel.app/api/auth/login</li>
          <li>Profile: https://apideabeacheck-153b.vercel.app/api/auth/me</li>
        </ul>

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Test Steps:</h4>
          <ol className="text-sm list-decimal list-inside space-y-1">
            <li>Test Health Check first</li>
            <li>Register a new user</li>
            <li>Login with the registered user</li>
            <li>Get profile (requires login token)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default ApiTest
