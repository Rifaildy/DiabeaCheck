const express = require("express");
const { body, validationResult } = require("express-validator");
const logger = require("../utils/logger");

const router = express.Router();

// In-memory storage for feedback (in production, use a database)
const feedbackStorage = [];

// Validation rules for feedback
const feedbackValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("category")
    .isIn(["general", "prediction", "ui", "performance", "suggestion"])
    .withMessage("Invalid feedback category"),
  body("message")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Message must be between 10 and 1000 characters"),
];

// POST /api/feedback
router.post("/", feedbackValidation, (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { name, email, rating, category, message } = req.body;

    // Create feedback object
    const feedback = {
      id: Date.now().toString(),
      name,
      email,
      rating,
      category,
      message,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      status: "received",
    };

    // Store feedback
    feedbackStorage.push(feedback);

    // Log feedback submission
    logger.info("Feedback submitted", {
      id: feedback.id,
      category: feedback.category,
      rating: feedback.rating,
      timestamp: feedback.timestamp,
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedbackId: feedback.id,
      timestamp: feedback.timestamp,
    });
  } catch (error) {
    logger.error("Feedback submission error:", error);
    res.status(500).json({
      error: "Failed to submit feedback",
      message: "Unable to process feedback submission",
    });
  }
});

// GET /api/feedback/stats (for admin/analytics)
router.get("/stats", (req, res) => {
  try {
    const stats = {
      total: feedbackStorage.length,
      byCategory: {},
      byRating: {},
      averageRating: 0,
      recent: feedbackStorage.slice(-5).map((f) => ({
        id: f.id,
        category: f.category,
        rating: f.rating,
        timestamp: f.timestamp,
      })),
    };

    // Calculate category distribution
    feedbackStorage.forEach((feedback) => {
      stats.byCategory[feedback.category] =
        (stats.byCategory[feedback.category] || 0) + 1;
      stats.byRating[feedback.rating] =
        (stats.byRating[feedback.rating] || 0) + 1;
    });

    // Calculate average rating
    if (feedbackStorage.length > 0) {
      const totalRating = feedbackStorage.reduce((sum, f) => sum + f.rating, 0);
      stats.averageRating = (totalRating / feedbackStorage.length).toFixed(2);
    }

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error("Feedback stats error:", error);
    res.status(500).json({
      error: "Failed to fetch feedback stats",
      message: "Unable to retrieve feedback statistics",
    });
  }
});

// GET /api/feedback/categories
router.get("/categories", (req, res) => {
  try {
    const categories = [
      {
        value: "general",
        label: "General Feedback",
        description: "General comments about the application",
      },
      {
        value: "prediction",
        label: "Prediction Accuracy",
        description: "Feedback about prediction results and accuracy",
      },
      {
        value: "ui",
        label: "User Interface",
        description: "Comments about design and user experience",
      },
      {
        value: "performance",
        label: "Performance",
        description: "Issues related to speed and performance",
      },
      {
        value: "suggestion",
        label: "Feature Suggestion",
        description: "Suggestions for new features or improvements",
      },
    ];

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    logger.error("Feedback categories error:", error);
    res.status(500).json({
      error: "Failed to fetch categories",
      message: "Unable to retrieve feedback categories",
    });
  }
});

module.exports = router;
