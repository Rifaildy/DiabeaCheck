const express = require("express");
const logger = require("../utils/logger");

const router = express.Router();

// Health tips data
const healthTips = [
  {
    id: 1,
    category: "nutrition",
    title: "Pola Makan Sehat",
    description: "Konsumsi makanan bergizi seimbang dengan porsi yang tepat",
    details: [
      "Perbanyak konsumsi sayuran hijau dan buah-buahan",
      "Pilih karbohidrat kompleks seperti nasi merah dan oat",
      "Batasi konsumsi gula dan makanan olahan",
      "Minum air putih minimal 8 gelas per hari",
    ],
    icon: "🥗",
  },
  {
    id: 2,
    category: "exercise",
    title: "Olahraga Teratur",
    description: "Lakukan aktivitas fisik minimal 30 menit setiap hari",
    details: [
      "Jalan kaki cepat selama 30 menit",
      "Bersepeda atau berenang 2-3 kali seminggu",
      "Latihan kekuatan 2 kali seminggu",
      "Yoga atau stretching untuk fleksibilitas",
    ],
    icon: "🏃‍♂️",
  },
  {
    id: 3,
    category: "weight",
    title: "Kontrol Berat Badan",
    description: "Jaga berat badan ideal sesuai dengan BMI yang sehat",
    details: [
      "Hitung BMI secara berkala",
      "Target penurunan berat badan 0.5-1 kg per minggu",
      "Hindari diet ekstrem",
      "Konsultasi dengan ahli gizi jika diperlukan",
    ],
    icon: "⚖️",
  },
  {
    id: 4,
    category: "checkup",
    title: "Pemeriksaan Rutin",
    description: "Lakukan check-up kesehatan secara berkala",
    details: [
      "Cek gula darah setiap 3 bulan",
      "Monitor tekanan darah secara rutin",
      "Pemeriksaan mata dan kaki untuk diabetesi",
      "Konsultasi dokter minimal 6 bulan sekali",
    ],
    icon: "🩺",
  },
  {
    id: 5,
    category: "lifestyle",
    title: "Gaya Hidup Sehat",
    description: "Terapkan kebiasaan hidup sehat sehari-hari",
    details: [
      "Tidur cukup 7-8 jam per malam",
      "Kelola stress dengan baik",
      "Hindari merokok dan alkohol berlebihan",
      "Jaga kebersihan diri dan lingkungan",
    ],
    icon: "🌟",
  },
  {
    id: 6,
    category: "monitoring",
    title: "Monitoring Kesehatan",
    description: "Pantau kondisi kesehatan secara mandiri",
    details: [
      "Catat hasil pengukuran gula darah",
      "Monitor berat badan mingguan",
      "Perhatikan gejala-gejala tidak normal",
      "Gunakan aplikasi kesehatan untuk tracking",
    ],
    icon: "📊",
  },
];

// GET /api/health/tips
router.get("/tips", (req, res) => {
  try {
    const { category, limit } = req.query;

    let filteredTips = healthTips;

    // Filter by category if specified
    if (category) {
      filteredTips = healthTips.filter(
        (tip) => tip.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Limit results if specified
    if (limit) {
      const limitNum = Number.parseInt(limit);
      if (limitNum > 0) {
        filteredTips = filteredTips.slice(0, limitNum);
      }
    }

    res.json({
      success: true,
      tips: filteredTips,
      total: filteredTips.length,
      categories: [
        "nutrition",
        "exercise",
        "weight",
        "checkup",
        "lifestyle",
        "monitoring",
      ],
    });
  } catch (error) {
    logger.error("Health tips error:", error);
    res.status(500).json({
      error: "Failed to fetch health tips",
      message: "Unable to retrieve health tips at this time",
    });
  }
});

// GET /api/health/tips/:id
router.get("/tips/:id", (req, res) => {
  try {
    const tipId = Number.parseInt(req.params.id);
    const tip = healthTips.find((t) => t.id === tipId);

    if (!tip) {
      return res.status(404).json({
        error: "Tip not found",
        message: "Health tip with specified ID does not exist",
      });
    }

    res.json({
      success: true,
      tip,
    });
  } catch (error) {
    logger.error("Health tip detail error:", error);
    res.status(500).json({
      error: "Failed to fetch health tip",
      message: "Unable to retrieve health tip details",
    });
  }
});

// GET /api/health/categories
router.get("/categories", (req, res) => {
  try {
    const categories = [
      {
        name: "nutrition",
        label: "Nutrisi",
        description: "Tips tentang pola makan sehat",
        icon: "🥗",
        count: healthTips.filter((tip) => tip.category === "nutrition").length,
      },
      {
        name: "exercise",
        label: "Olahraga",
        description: "Tips tentang aktivitas fisik",
        icon: "🏃‍♂️",
        count: healthTips.filter((tip) => tip.category === "exercise").length,
      },
      {
        name: "weight",
        label: "Berat Badan",
        description: "Tips kontrol berat badan",
        icon: "⚖️",
        count: healthTips.filter((tip) => tip.category === "weight").length,
      },
      {
        name: "checkup",
        label: "Pemeriksaan",
        description: "Tips pemeriksaan kesehatan",
        icon: "🩺",
        count: healthTips.filter((tip) => tip.category === "checkup").length,
      },
      {
        name: "lifestyle",
        label: "Gaya Hidup",
        description: "Tips gaya hidup sehat",
        icon: "🌟",
        count: healthTips.filter((tip) => tip.category === "lifestyle").length,
      },
      {
        name: "monitoring",
        label: "Monitoring",
        description: "Tips monitoring kesehatan",
        icon: "📊",
        count: healthTips.filter((tip) => tip.category === "monitoring").length,
      },
    ];

    res.json({
      success: true,
      categories,
      total: categories.length,
    });
  } catch (error) {
    logger.error("Health categories error:", error);
    res.status(500).json({
      error: "Failed to fetch categories",
      message: "Unable to retrieve health tip categories",
    });
  }
});

module.exports = router;
