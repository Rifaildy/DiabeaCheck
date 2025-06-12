"use client"

import { useState } from "react"
import { checkHealth, register, login, getProfile } from "../../services/api"

const ApiTest = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})

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
      test: () =>
        register({
          name: "Test User",
          email: "test@example.com",
          password: "123456",
        }),
    },
    {
      name: "Login Test",
      key: "login",
      test: () =>
        login({
          email: "test@example.com",
          password: "123456",
        }),
    },
    {
      name: "Get Profile",
      key: "profile",
      test: () => getProfile(),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">API Connection Test</h1>

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
                  <pre className="text-sm overflow-auto">
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
          <li>Profile: https://apideabeacheck-153b.vercel.app/api/user/profile</li>
        </ul>
      </div>
    </div>
  )
}

export default ApiTest
