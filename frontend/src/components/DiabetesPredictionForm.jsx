"use client"

import { useState } from "react"
import { predictDiabetes } from "../api"

const DiabetesPredictionForm = () => {
  const [formData, setFormData] = useState({
    pregnancies: 0,
    glucose: 0,
    bloodPressure: 0,
    skinThickness: 0,
    insulin: 0,
    bmi: 0,
    diabetesPedigreeFunction: 0,
    age: 0,
  })
  const [predictionResult, setPredictionResult] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      console.log("Submitting prediction with data:", formData)

      // Make sure all required fields are numbers
      const predictionData = {
        age: Number.parseFloat(formData.age),
        glucose: Number.parseFloat(formData.glucose),
        bloodPressure: Number.parseFloat(formData.bloodPressure),
        bmi: Number.parseFloat(formData.bmi),
        insulin: Number.parseFloat(formData.insulin || 0),
        skinThickness: Number.parseFloat(formData.skinThickness || 0),
        diabetesPedigreeFunction: Number.parseFloat(formData.diabetesPedigreeFunction || 0),
        pregnancies: Number.parseFloat(formData.pregnancies || 0),
      }

      console.log("Processed prediction data:", predictionData)

      const result = await predictDiabetes(predictionData)
      console.log("Prediction result:", result)

      // Handle the response according to your backend documentation
      if (result.success) {
        // Use the data from the response
        setPredictionResult(result.data)

        // Show success message
        setError("")

        // Navigate to results or show results
        // You can add navigation logic here if needed
      } else {
        throw new Error(result.message || "Prediction failed")
      }
    } catch (error) {
      console.error("Prediction error:", error)
      setError(error.message || "Terjadi kesalahan saat melakukan prediksi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h2>Diabetes Prediction Form</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Pregnancies:</label>
          <input type="number" name="pregnancies" value={formData.pregnancies} onChange={handleChange} />
        </div>
        <div>
          <label>Glucose:</label>
          <input type="number" name="glucose" value={formData.glucose} onChange={handleChange} />
        </div>
        <div>
          <label>Blood Pressure:</label>
          <input type="number" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} />
        </div>
        <div>
          <label>Skin Thickness:</label>
          <input type="number" name="skinThickness" value={formData.skinThickness} onChange={handleChange} />
        </div>
        <div>
          <label>Insulin:</label>
          <input type="number" name="insulin" value={formData.insulin} onChange={handleChange} />
        </div>
        <div>
          <label>BMI:</label>
          <input type="number" name="bmi" value={formData.bmi} onChange={handleChange} />
        </div>
        <div>
          <label>Diabetes Pedigree Function:</label>
          <input
            type="number"
            name="diabetesPedigreeFunction"
            value={formData.diabetesPedigreeFunction}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Age:</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Predicting..." : "Predict"}
        </button>
      </form>

      {predictionResult && (
        <div>
          <h3>Prediction Result:</h3>
          <p>Outcome: {predictionResult.outcome}</p>
        </div>
      )}
    </div>
  )
}

export default DiabetesPredictionForm
