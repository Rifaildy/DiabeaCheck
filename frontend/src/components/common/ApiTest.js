"use client"

import { useState } from "react"
import { checkHealth, register, login } from "../../services/api"

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

  const testHealth = () => testEndpoint("health", checkHealth)

  const testRegister = () =>
    testEndpoint("register", () =>
      register({
        name: "Test User",
        email: "test@example.com",
        password: "123456",
      }),
    )

  const testLogin = () =>
    testEndpoint("login", () =>
      login({
        email: "test@example.com",
        password: "123456",
      }),
    )

  const ResultDisplay = ({ name, result }) => {
    if (!result) return null

    return (
      <div className={`mt-2 p-3 rounded ${result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
        <strong>{name}:</strong>
        {result.success ? (
          <pre className="mt-1 text-xs overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
        ) : (
          <p className="mt-1">{result.error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">API Connection Test</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={testHealth}
          disabled={loading.health}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading.health ? "Testing..." : "Test Health"}
        </button>

        <button
          onClick={testRegister}
          disabled={loading.register}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading.register ? "Testing..." : "Test Register"}
        </button>

        <button
          onClick={testLogin}
          disabled={loading.login}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading.login ? "Testing..." : "Test Login"}
        </button>
      </div>

      <div className="space-y-4">
        <ResultDisplay name="Health Check" result={results.health} />
        <ResultDisplay name="Register" result={results.register} />
        <ResultDisplay name="Login" result={results.login} />
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">API Configuration:</h3>
        <p>
          <strong>Base URL:</strong> https://apideabeacheck-153b.vercel.app/api
        </p>
        <p>
          <strong>Frontend URL:</strong> https://diabea-check-5ok4.vercel.app
        </p>
        <div className="mt-2">
          <strong>Test Endpoints:</strong>
          <ul className="list-disc list-inside mt-1 text-sm">
            <li>GET /health → https://apideabeacheck-153b.vercel.app/api/health</li>
            <li>POST /auth/register → https://apideabeacheck-153b.vercel.app/api/auth/register</li>
            <li>POST /auth/login → https://apideabeacheck-153b.vercel.app/api/auth/login</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ApiTest
