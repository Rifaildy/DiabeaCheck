"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import {
  FaHistory,
  FaTrash,
  FaEye,
  FaCalendarAlt,
  FaHeartbeat,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaArrowLeft,
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { getPredictionHistory, deletePrediction } from "../../services/api"
import LoadingSpinner from "../common/LoadingSpinner"

const History = () => {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPrediction, setSelectedPrediction] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    loadHistory()
  }, [currentPage])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const response = await getPredictionHistory(currentPage, 10)
      setPredictions(response.predictions)
      setTotalPages(response.totalPages)
    } catch (error) {
      toast.error("Gagal memuat riwayat prediksi")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus prediksi ini?")) {
      try {
        await deletePrediction(id)
        toast.success("Prediksi berhasil dihapus")
        loadHistory()
      } catch (error) {
        toast.error("Gagal menghapus prediksi")
      }
    }
  }

  const handleViewDetail = (prediction) => {
    setSelectedPrediction(prediction)
    setShowModal(true)
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-100"
      case "moderate":
        return "text-yellow-600 bg-yellow-100"
      case "low":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case "high":
        return <FaExclamationTriangle className="h-4 w-4" />
      case "moderate":
        return <FaHeartbeat className="h-4 w-4" />
      case "low":
        return <FaCheckCircle className="h-4 w-4" />
      default:
        return <FaHeartbeat className="h-4 w-4" />
    }
  }

  const filteredPredictions = predictions.filter(
    (prediction) =>
      prediction.risk_level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(prediction.predicted_at).toLocaleDateString("id-ID").includes(searchTerm),
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors mr-4"
            >
              <FaArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaHistory className="h-8 w-8 mr-3 text-blue-600" />
            Riwayat Prediksi
          </h1>
          <p className="text-gray-600 mt-2">Lihat dan kelola riwayat prediksi diabetes Anda</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Cari berdasarkan tingkat risiko atau tanggal..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Predictions List */}
        <div className="bg-white rounded-lg shadow">
          {filteredPredictions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredPredictions.map((prediction, index) => (
                <div key={index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${getRiskColor(prediction.risk_level)}`}>
                        {getRiskIcon(prediction.risk_level)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Risiko{" "}
                          {prediction.risk_level === "High"
                            ? "Tinggi"
                            : prediction.risk_level === "Moderate"
                              ? "Sedang"
                              : "Rendah"}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FaCalendarAlt className="h-4 w-4 mr-1" />
                          {new Date(prediction.predicted_at).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        {/* Display input data summary */}
                        <div className="text-xs text-gray-400 mt-1">
                          Usia: {prediction.age || "N/A"} | Glukosa: {prediction.glucose || "N/A"} | BMI:{" "}
                          {prediction.bmi || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{Math.round(prediction.probability * 100)}%</p>
                        <p className="text-sm text-gray-500">Probabilitas</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(prediction)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <FaEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prediction.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaHistory className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "Tidak ada hasil pencarian" : "Belum ada riwayat prediksi"}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? "Coba kata kunci lain" : "Mulai dengan membuat prediksi pertama Anda"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === i + 1
                      ? "text-blue-600 bg-blue-50 border border-blue-300"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </nav>
          </div>
        )}

        {/* Detail Modal */}
        {showModal && selectedPrediction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Detail Prediksi</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Hasil Prediksi */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Hasil Prediksi</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Tingkat Risiko</p>
                        <p
                          className={`text-lg font-semibold ${
                            selectedPrediction.risk_level === "High"
                              ? "text-red-600"
                              : selectedPrediction.risk_level === "Moderate"
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {selectedPrediction.risk_level === "High"
                            ? "Tinggi"
                            : selectedPrediction.risk_level === "Moderate"
                              ? "Sedang"
                              : "Rendah"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Probabilitas</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {Math.round(selectedPrediction.probability * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Data Input */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Input</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Usia</p>
                        <p className="text-gray-900">{selectedPrediction.age || "N/A"} tahun</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Glukosa</p>
                        <p className="text-gray-900">{selectedPrediction.glucose || "N/A"} mg/dL</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tekanan Darah</p>
                        <p className="text-gray-900">{selectedPrediction.blood_pressure || "N/A"} mmHg</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">BMI</p>
                        <p className="text-gray-900">{selectedPrediction.bmi || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ketebalan Kulit</p>
                        <p className="text-gray-900">{selectedPrediction.skin_thickness || "N/A"} mm</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Insulin</p>
                        <p className="text-gray-900">{selectedPrediction.insulin || "N/A"} mu U/ml</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Riwayat Keluarga</p>
                        <p className="text-gray-900">{selectedPrediction.diabetes_pedigree_function || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Jumlah Kehamilan</p>
                        <p className="text-gray-900">{selectedPrediction.pregnancies || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rekomendasi */}
                  {selectedPrediction.recommendations && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Rekomendasi</h3>
                      <ul className="space-y-2">
                        {selectedPrediction.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default History
