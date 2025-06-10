"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import predictionService from "../services/predictionService"

const DiabetesPredictionForm = () => {
  const [formData, setFormData] = useState({
    glucose: "",
    bloodPressure: "",
    bmi: "",
    age: "",
    pregnancies: "",
    skinThickness: "",
    insulin: "",
    diabetesPedigreeFunction: "",
  })

  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setPrediction(null)

    try {
      // Convert string values to numbers
      const numericData = {}
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "") {
          numericData[key] = Number.parseFloat(formData[key])
        }
      })

      const result = await predictionService.predictDiabetes(numericData)
      setPrediction(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "Low":
        return "text-green-600"
      case "Medium":
        return "text-yellow-600"
      case "High":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Diabetes Risk Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="glucose">Glucose Level (mg/dL) *</Label>
                <Input
                  id="glucose"
                  name="glucose"
                  type="number"
                  value={formData.glucose}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="500"
                />
              </div>

              <div>
                <Label htmlFor="bloodPressure">Blood Pressure (mmHg) *</Label>
                <Input
                  id="bloodPressure"
                  name="bloodPressure"
                  type="number"
                  value={formData.bloodPressure}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="300"
                />
              </div>

              <div>
                <Label htmlFor="bmi">BMI *</Label>
                <Input
                  id="bmi"
                  name="bmi"
                  type="number"
                  step="0.1"
                  value={formData.bmi}
                  onChange={handleInputChange}
                  required
                  min="10"
                  max="100"
                />
              </div>

              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="120"
                />
              </div>

              <div>
                <Label htmlFor="pregnancies">Pregnancies</Label>
                <Input
                  id="pregnancies"
                  name="pregnancies"
                  type="number"
                  value={formData.pregnancies}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                />
              </div>

              <div>
                <Label htmlFor="skinThickness">Skin Thickness (mm)</Label>
                <Input
                  id="skinThickness"
                  name="skinThickness"
                  type="number"
                  value={formData.skinThickness}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <Label htmlFor="insulin">Insulin (μU/mL)</Label>
                <Input
                  id="insulin"
                  name="insulin"
                  type="number"
                  value={formData.insulin}
                  onChange={handleInputChange}
                  min="0"
                  max="1000"
                />
              </div>

              <div>
                <Label htmlFor="diabetesPedigreeFunction">Diabetes Pedigree Function</Label>
                <Input
                  id="diabetesPedigreeFunction"
                  name="diabetesPedigreeFunction"
                  type="number"
                  step="0.001"
                  value={formData.diabetesPedigreeFunction}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Analyzing..." : "Predict Diabetes Risk"}
            </Button>
          </form>

          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {prediction && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Prediction Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold">Prediction</h3>
                      <p className="text-2xl font-bold">
                        {prediction.prediction === 1 ? "Diabetes Risk" : "No Diabetes Risk"}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold">Risk Level</h3>
                      <p className={`text-2xl font-bold ${getRiskColor(prediction.riskLevel)}`}>
                        {prediction.riskLevel}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold">Diabetes Probability</h3>
                      <p className="text-2xl font-bold">{(prediction.probability.diabetes * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Recommendations</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {prediction.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DiabetesPredictionForm
