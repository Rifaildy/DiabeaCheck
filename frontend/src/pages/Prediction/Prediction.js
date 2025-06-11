"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faUser,
  faHeartbeat,
  faWeight,
  faRulerVertical,
  faVial,
  faUsers,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons"
import { predictDiabetes } from "../../services/api"

const Prediction = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    age: "",
    glucose: "",
    bloodPressure: "",
    skinThickness: "",
    insulin: "",
    bmi: "",
    diabetesPedigreeFunction: "",
    pregnancies: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const requiredFields = ["age", "glucose", "bloodPressure", "bmi", "insulin"] // Menambahkan insulin sebagai wajib diisi
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Field ${field} harus diisi`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      // Sanitize data - convert empty strings to null for optional fields
      const sanitizedData = {
        age: Number.parseFloat(formData.age),
        glucose: Number.parseFloat(formData.glucose),
        bloodPressure: Number.parseFloat(formData.bloodPressure),
        bmi: Number.parseFloat(formData.bmi),
        skinThickness: formData.skinThickness ? Number.parseFloat(formData.skinThickness) : null,
        insulin: formData.insulin ? Number.parseFloat(formData.insulin) : null,
        diabetesPedigreeFunction: formData.diabetesPedigreeFunction
          ? Number.parseFloat(formData.diabetesPedigreeFunction)
          : null,
        pregnancies: formData.pregnancies ? Number.parseInt(formData.pregnancies) : null,
      }

      console.log("Submitting prediction with data:", sanitizedData)

      const result = await predictDiabetes(sanitizedData)
      console.log("Prediction result received:", result)

      // Store result in sessionStorage to pass to results page
      const resultData = {
        ...result,
        inputData: formData,
        timestamp: new Date().toISOString(),
      }

      sessionStorage.setItem("predictionResult", JSON.stringify(resultData))
      console.log("Stored result in sessionStorage:", resultData)

      // Navigate to results page
      console.log("Navigating to results page...")
      navigate("/results", { replace: true })
    } catch (error) {
      console.error("Prediction error:", error)
      toast.error("Terjadi kesalahan saat melakukan prediksi: " + (error.message || "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  // Fields wajib diisi
  const requiredFields = [
    {
      name: "age",
      label: "Usia",
      type: "number",
      icon: faUser,
      placeholder: "Masukkan usia (tahun)",
      required: true,
      min: 1,
      max: 120,
    },
    {
      name: "glucose",
      label: "Kadar Glukosa",
      type: "number",
      icon: faVial,
      placeholder: "Kadar glukosa darah (mg/dL)",
      required: true,
      min: 0,
      max: 300,
    },
    {
      name: "bloodPressure",
      label: "Tekanan Darah",
      type: "number",
      icon: faHeartbeat,
      placeholder: "Tekanan darah sistolik (mmHg)",
      required: true,
      min: 0,
      max: 250,
    },
    {
      name: "insulin",
      label: "Insulin",
      type: "number",
      icon: faVial,
      placeholder: "Kadar insulin (mu U/ml) - Wajib diisi",
      required: true, // Mengubah insulin menjadi wajib
      min: 0,
      max: 1000,
    },
    {
      name: "bmi",
      label: "BMI (Body Mass Index)",
      type: "number",
      icon: faWeight,
      placeholder: "Indeks massa tubuh",
      required: true,
      min: 10,
      max: 70,
      step: 0.1,
    },
  ]

  // Fields opsional
  const optionalFields = [
    {
      name: "skinThickness",
      label: "Ketebalan Kulit",
      type: "number",
      icon: faRulerVertical,
      placeholder: "Ketebalan kulit triceps (mm) - Opsional",
      required: false,
      min: 0,
      max: 100,
    },
    {
      name: "diabetesPedigreeFunction",
      label: "Riwayat Keluarga",
      type: "number",
      icon: faUsers,
      placeholder: "Fungsi silsilah diabetes (0.0-2.5) - Opsional",
      required: false,
      min: 0,
      max: 2.5,
      step: 0.001,
    },
    {
      name: "pregnancies",
      label: "Jumlah Kehamilan",
      type: "number",
      icon: faUser,
      placeholder: "Jumlah kehamilan (untuk wanita) - Opsional",
      required: false,
      min: 0,
      max: 20,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Prediksi Risiko Diabetes</h1>
          <p className="text-xl text-gray-600">Masukkan data medis Anda untuk mendapatkan prediksi risiko diabetes</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Wajib Diisi */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Wajib Diisi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requiredFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={field.icon} className="mr-2 text-blue-600" />
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    required={field.required}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              ))}
            </div>

            {/* Opsional */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">Data Opsional</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {optionalFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={field.icon} className="mr-2 text-blue-600" />
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    required={field.required}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Informasi Penting:</h3>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Field yang bertanda (*) wajib diisi</li>
                <li>• BMI dapat dihitung dengan rumus: Berat Badan (kg) / (Tinggi Badan (m))²</li>
                <li>• Field opsional dapat dikosongkan jika tidak diketahui</li>
                <li>• Untuk hasil yang lebih akurat, konsultasikan dengan dokter</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Memproses Prediksi...
                  </>
                ) : (
                  "Prediksi Sekarang"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Disclaimer:</h3>
          <p className="text-yellow-700">
            Hasil prediksi ini hanya untuk referensi dan tidak menggantikan diagnosis medis profesional. Selalu
            konsultasikan dengan dokter untuk pemeriksaan dan diagnosis yang akurat.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Prediction
