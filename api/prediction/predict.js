module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // Mock prediction response
  const mockPrediction = {
    prediction: Math.random() > 0.5 ? "Low Risk" : "High Risk",
    confidence: Math.round(Math.random() * 100),
    recommendations: ["Maintain a healthy diet", "Exercise regularly", "Monitor blood sugar levels"],
  }

  res.status(200).json({
    success: true,
    message: "Prediction completed",
    data: mockPrediction,
    timestamp: new Date().toISOString(),
  })
}
