"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaUser, FaChartLine, FaHistory, FaHeartbeat, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa"
import { getDashboard } from "../../services/api"
import LoadingSpinner from "../common/LoadingSpinner"

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const response = await getDashboard()
      setDashboardData(response.dashboard)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-600 text-center p-4">Error: {error}</div>
  if (!dashboardData) return <div className="text-center p-4">No data available</div>

  const { user, stats, recentPredictions } = dashboardData

  // Get latest prediction percentage
  const latestPredictionPercentage =
    recentPredictions && recentPredictions.length > 0 ? Math.round(recentPredictions[0].probability * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Selamat datang, {user.firstName}!</h1>
          <p className="text-gray-600 mt-2">Kelola kesehatan diabetes Anda dengan mudah</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaChartLine className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Prediksi</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.total_predictions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Risiko Tinggi</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.high_risk_count || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Risiko Rendah</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.low_risk_count || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaHeartbeat className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prediksi Terakhir</p>
                <p className="text-2xl font-semibold text-gray-900">{latestPredictionPercentage}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/prediction" className="bg-blue-600 text-white rounded-lg p-6 hover:bg-blue-700 transition-colors">
            <div className="flex items-center">
              <FaHeartbeat className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Prediksi Baru</h3>
                <p className="text-blue-100">Lakukan tes prediksi diabetes</p>
              </div>
            </div>
          </Link>

          <Link to="/history" className="bg-green-600 text-white rounded-lg p-6 hover:bg-green-700 transition-colors">
            <div className="flex items-center">
              <FaHistory className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Riwayat</h3>
                <p className="text-green-100">Lihat riwayat prediksi</p>
              </div>
            </div>
          </Link>

          <Link to="/profile" className="bg-purple-600 text-white rounded-lg p-6 hover:bg-purple-700 transition-colors">
            <div className="flex items-center">
              <FaUser className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Profil</h3>
                <p className="text-purple-100">Kelola profil Anda</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Predictions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Prediksi Terbaru</h2>
          </div>
          <div className="p-6">
            {recentPredictions && recentPredictions.length > 0 ? (
              <div className="space-y-4">
                {recentPredictions.map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full ${
                          prediction.risk_level === "High"
                            ? "bg-red-100"
                            : prediction.risk_level === "Moderate"
                              ? "bg-yellow-100"
                              : "bg-green-100"
                        }`}
                      >
                        <FaHeartbeat
                          className={`h-4 w-4 ${
                            prediction.risk_level === "High"
                              ? "text-red-600"
                              : prediction.risk_level === "Moderate"
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          Risiko{" "}
                          {prediction.risk_level === "High"
                            ? "Tinggi"
                            : prediction.risk_level === "Moderate"
                              ? "Sedang"
                              : "Rendah"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(prediction.predicted_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{Math.round(prediction.probability * 100)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaHeartbeat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada prediksi</p>
                <Link to="/prediction" className="text-blue-600 hover:text-blue-700 font-medium">
                  Buat prediksi pertama Anda
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
