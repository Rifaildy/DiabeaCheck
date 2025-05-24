import axios from "axios";

// Base URL for API
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(
      "Making API request:",
      config.method?.toUpperCase(),
      config.url
    );
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("API response received:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("Response error:", error.response?.data || error.message);

    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 400:
          throw new Error(data.message || "Invalid request data");
        case 404:
          throw new Error("API endpoint not found");
        case 500:
          throw new Error("Internal server error");
        default:
          throw new Error(data.message || "An error occurred");
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(
        "Unable to connect to server. Please check your internet connection."
      );
    } else {
      // Something else happened
      throw new Error("An unexpected error occurred");
    }
  }
);

// API Functions

/**
 * Predict diabetes risk based on input data
 * @param {Object} inputData - Medical data for prediction
 * @returns {Promise<Object>} Prediction result
 */
export const predictDiabetes = async (inputData) => {
  try {
    // Validate input data
    const requiredFields = ["age", "glucose", "bloodPressure", "bmi"];
    for (const field of requiredFields) {
      if (!inputData[field]) {
        throw new Error(`Field ${field} is required`);
      }
    }

    // Prepare data for API
    const requestData = {
      age: Number.parseFloat(inputData.age),
      glucose: Number.parseFloat(inputData.glucose),
      bloodPressure: Number.parseFloat(inputData.bloodPressure),
      skinThickness: Number.parseFloat(inputData.skinThickness) || 0,
      insulin: Number.parseFloat(inputData.insulin) || 0,
      bmi: Number.parseFloat(inputData.bmi),
      diabetesPedigreeFunction:
        Number.parseFloat(inputData.diabetesPedigreeFunction) || 0,
      pregnancies: Number.parseInt(inputData.pregnancies) || 0,
    };

    console.log("Sending prediction request with data:", requestData);

    const response = await api.post("/predict", requestData);

    return {
      prediction: response.data.prediction,
      probability: response.data.probability,
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Prediction API error:", error);

    // For development/demo purposes, return mock data if API is not available
    if (error.message.includes("connect to server")) {
      console.warn("API not available, returning mock prediction data");
      return getMockPrediction(inputData);
    }

    throw error;
  }
};

/**
 * Get health tips and recommendations
 * @returns {Promise<Array>} Array of health tips
 */
export const getHealthTips = async () => {
  try {
    const response = await api.get("/health-tips");
    return response.data.tips;
  } catch (error) {
    console.error("Health tips API error:", error);

    // Return default tips if API is not available
    return getDefaultHealthTips();
  }
};

/**
 * Submit feedback about the application
 * @param {Object} feedbackData - User feedback
 * @returns {Promise<Object>} Submission result
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await api.post("/feedback", feedbackData);
    return response.data;
  } catch (error) {
    console.error("Feedback submission error:", error);
    throw error;
  }
};

// Mock Functions for Development/Demo

/**
 * Generate mock prediction for demo purposes
 * @param {Object} inputData - Input medical data
 * @returns {Object} Mock prediction result
 */
const getMockPrediction = (inputData) => {
  // Simple mock logic based on input values
  const glucose = Number.parseFloat(inputData.glucose);
  const bmi = Number.parseFloat(inputData.bmi);
  const age = Number.parseFloat(inputData.age);

  // Calculate risk score based on common diabetes risk factors
  let riskScore = 0;

  if (glucose > 140) riskScore += 0.3;
  else if (glucose > 100) riskScore += 0.1;

  if (bmi > 30) riskScore += 0.2;
  else if (bmi > 25) riskScore += 0.1;

  if (age > 45) riskScore += 0.2;
  else if (age > 35) riskScore += 0.1;

  if (inputData.bloodPressure > 140) riskScore += 0.1;

  // Add some randomness
  riskScore += Math.random() * 0.2 - 0.1;

  // Ensure score is between 0 and 1
  riskScore = Math.max(0, Math.min(1, riskScore));

  const prediction = riskScore > 0.5 ? 1 : 0;

  return {
    prediction,
    probability: riskScore,
    message:
      prediction === 1
        ? "High risk detected. Please consult with a healthcare professional."
        : "Low risk detected. Continue maintaining a healthy lifestyle.",
    timestamp: new Date().toISOString(),
  };
};

/**
 * Get default health tips
 * @returns {Array} Default health tips
 */
const getDefaultHealthTips = () => {
  return [
    {
      id: 1,
      title: "Pola Makan Sehat",
      description: "Konsumsi makanan bergizi seimbang dengan porsi yang tepat",
      category: "nutrition",
    },
    {
      id: 2,
      title: "Olahraga Teratur",
      description: "Lakukan aktivitas fisik minimal 30 menit setiap hari",
      category: "exercise",
    },
    {
      id: 3,
      title: "Kontrol Berat Badan",
      description: "Jaga berat badan ideal sesuai dengan BMI yang sehat",
      category: "weight",
    },
    {
      id: 4,
      title: "Pemeriksaan Rutin",
      description: "Lakukan check-up kesehatan secara berkala",
      category: "checkup",
    },
  ];
};

export default api;
