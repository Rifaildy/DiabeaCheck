# DiabeaCheck Frontend

Sistem berbasis web untuk deteksi risiko penyakit diabetes menggunakan Machine Learning - Frontend Application.

## 🚀 Tentang Proyek

DiabeaCheck adalah aplikasi web yang memungkinkan pengguna untuk melakukan deteksi dini risiko diabetes menggunakan teknologi Machine Learning. Aplikasi ini dikembangkan oleh Tim CC25-CF186 sebagai bagian dari Capstone Project Bangkit 2024.

## ✨ Fitur Utama

- **Prediksi Risiko Diabetes**: Input data medis untuk mendapatkan prediksi risiko
- **Interface Responsif**: Desain yang optimal untuk desktop dan mobile
- **Hasil Real-time**: Prediksi langsung setelah input data
- **Laporan Downloadable**: Unduh hasil prediksi dalam format teks
- **Rekomendasi Kesehatan**: Saran berdasarkan hasil prediksi

## 🛠️ Teknologi yang Digunakan

- **Frontend Framework**: React.js 18
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Font Awesome
- **Notifications**: React Toastify
- **Build Tool**: Create React App

## 📋 Prasyarat

Pastikan Anda telah menginstall:

- Node.js (versi 16 atau lebih baru)
- npm atau yarn
- Git

## 🔧 Instalasi

1. **Clone repository**
   \`\`\`bash
   git clone https://github.com/your-username/diabeacheck-frontend.git
   cd diabeacheck-frontend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Setup environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Edit file `.env` sesuai dengan konfigurasi Anda.

4. **Jalankan aplikasi**
   \`\`\`bash
   npm start
   \`\`\`

   Aplikasi akan berjalan di `http://localhost:3000`

## 📁 Struktur Proyek

\`\`\`
src/
├── components/
│   ├── common/          # Komponen umum
│   ├── forms/           # Komponen form
│   └── layout/          # Komponen layout
├── pages/
│   ├── Home/            # Halaman beranda
│   ├── Prediction/      # Halaman prediksi
│   ├── Results/         # Halaman hasil
│   └── About/           # Halaman tentang
├── services/
│   └── api.js           # Service API
├── utils/
│   ├── helpers.js       # Helper functions
│   └── validation.js    # Validasi form
├── App.js               # Komponen utama
└── index.js             # Entry point
\`\`\`

## 🔌 API Integration

Aplikasi ini terintegrasi dengan backend API untuk:

- Prediksi risiko diabetes
- Mendapatkan tips kesehatan
- Submit feedback pengguna

Konfigurasi API dapat diatur melalui environment variable `REACT_APP_API_BASE_URL`.

## 🎨 Customization

### Styling
- Gunakan Tailwind CSS untuk styling
- Custom components tersedia di `src/index.css`
- Konfigurasi Tailwind di `tailwind.config.js`

### Komponen
- Komponen reusable tersedia di folder `components/`
- Ikuti pattern yang sudah ada untuk konsistensi

## 🧪 Testing

\`\`\`bash
# Jalankan test
npm test

# Test dengan coverage
npm test -- --coverage
\`\`\`

## 🚀 Deployment

### Build untuk Production

\`\`\`bash
npm run build
\`\`\`

### Deploy ke Vercel

1. Install Vercel CLI
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. Deploy
   \`\`\`bash
   vercel --prod
   \`\`\`

### Deploy ke Netlify

1. Build aplikasi
   \`\`\`bash
   npm run build
   \`\`\`

2. Upload folder `build/` ke Netlify

## 🔧 Scripts Tersedia

- `npm start` - Jalankan development server
- `npm run build` - Build untuk production
- `npm test` - Jalankan test
- `npm run lint` - Linting code
- `npm run format` - Format code dengan Prettier

## 👥 Tim Pengembang

**Tim CC25-CF186 - Bangkit 2024**

### Machine Learning Team
- **Alfiah** (MC796D5X0076) - Politeknik Baja Tegal
- **Elaine Agustina** (MC834D5X1658) - Universitas Pelita Harapan  
- **Rafly Ashraffi Rachmat** (MC796D5Y0101) - Politeknik Baja Tegal

### Frontend/Backend Team
- **Ilham Bintang Prakoso** (FC327D5Y1041) - Universitas Teknologi Yogyakarta
- **Nasrun Hidayattullah** (FC327D5Y0383) - Universitas Teknologi Yogyakarta
- **Rifaildy Nurhuda Assalam** (FC327D5Y0431) - Universitas Teknologi Yogyakarta

## 📄 Lisensi

Proyek ini dikembangkan untuk keperluan edukasi sebagai bagian dari Capstone Project Bangkit 2024.

## 🤝 Kontribusi

Untuk kontribusi atau pertanyaan, silakan hubungi tim pengembang melalui:
- Email: diabeacheck@bangkit.academy
- Tim ID: CC25-CF186

## ⚠️ Disclaimer

Aplikasi ini dikembangkan untuk tujuan edukasi dan penelitian. Hasil prediksi tidak menggantikan diagnosis medis profesional. Selalu konsultasikan dengan dokter untuk pemeriksaan kesehatan yang akurat.

# DiabeaCheck Backend API

Backend API untuk sistem prediksi risiko diabetes DiabeaCheck yang dikembangkan oleh Tim CC25-CF186.

## 🚀 Tentang Proyek

Backend ini menyediakan API untuk aplikasi DiabeaCheck yang memungkinkan prediksi risiko diabetes menggunakan Machine Learning. API ini dibangun dengan Node.js dan Express.js dengan integrasi TensorFlow.js untuk model ML.

## ✨ Fitur Utama

- **Prediksi Diabetes**: API endpoint untuk prediksi risiko diabetes
- **Health Tips**: Endpoint untuk tips kesehatan
- **Feedback System**: Sistem feedback pengguna
- **Rate Limiting**: Pembatasan request untuk keamanan
- **Logging**: Sistem logging komprehensif
- **Error Handling**: Penanganan error yang robust
- **Docker Support**: Containerization dengan Docker

## 🛠️ Teknologi yang Digunakan

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ML Library**: TensorFlow.js
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Containerization**: Docker

## 📋 Prasyarat

- Node.js 16+ dan npm
- Docker (opsional)
- Git

## 🔧 Instalasi

### Instalasi Lokal

1. **Clone repository**
   \`\`\`bash
   git clone https://github.com/your-username/diabeacheck-backend.git
   cd diabeacheck-backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Setup environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Edit file `.env` sesuai konfigurasi Anda.

4. **Buat direktori logs**
   \`\`\`bash
   mkdir logs
   \`\`\`

5. **Jalankan server**
   \`\`\`bash
   # Development
   npm run dev
   
   # Production
   npm start
   \`\`\`

### Instalasi dengan Docker

1. **Build image**
   \`\`\`bash
   docker build -t diabeacheck-backend .
   \`\`\`

2. **Run container**
   \`\`\`bash
   docker run -p 5000:5000 diabeacheck-backend
   \`\`\`

3. **Atau gunakan Docker Compose**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

## 📚 API Documentation

### Base URL
\`\`\`
http://localhost:5000
\`\`\`

### Endpoints

#### Health Check
\`\`\`
GET /health
\`\`\`

#### Prediksi Diabetes
\`\`\`
POST /api/predict
Content-Type: application/json

{
  "age": 45,
  "glucose": 140,
  "bloodPressure": 80,
  "skinThickness": 20,
  "insulin": 79,
  "bmi": 25.5,
  "diabetesPedigreeFunction": 0.5,
  "pregnancies": 2
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "prediction": 0,
  "probability": 0.35,
  "confidence": 0.7,
  "riskLevel": "Moderate",
  "message": "Moderate risk detected...",
  "recommendations": [...],
  "timestamp": "2024-12-01T10:00:00.000Z"
}
\`\`\`

#### Health Tips
\`\`\`
GET /api/health/tips
GET /api/health/tips?category=nutrition&limit=5
GET /api/health/tips/:id
\`\`\`

#### Feedback
\`\`\`
POST /api/feedback
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "rating": 5,
  "category": "general",
  "message": "Great application!"
}
\`\`\`

### Error Responses

Semua error response mengikuti format:
\`\`\`json
{
  "error": "Error message",
  "timestamp": "2024-12-01T10:00:00.000Z",
  "path": "/api/predict"
}
\`\`\`

## 🔒 Keamanan

- **Rate Limiting**: 100 requests per 15 menit
- **Prediction Rate Limiting**: 10 requests per menit
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Validasi input komprehensif

## 📊 Monitoring & Logging

- **Winston Logger**: Structured logging
- **Health Check**: Endpoint untuk monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Request timing dan metrics

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
\`\`\`

## 🚀 Deployment

### Vercel
\`\`\`bash
npm i -g vercel
vercel --prod
\`\`\`

### Railway
\`\`\`bash
npm i -g @railway/cli
railway login
railway deploy
\`\`\`

### Docker Production
\`\`\`bash
docker build -t diabeacheck-backend .
docker run -d -p 5000:5000 --name diabeacheck-api diabeacheck-backend
\`\`\`

## 📁 Struktur Proyek

\`\`\`
├── routes/
│   ├── prediction.js     # Prediction endpoints
│   ├── health.js         # Health tips endpoints
│   └── feedback.js       # Feedback endpoints
├── services/
│   └── predictionService.js  # ML prediction service
├── middleware/
│   └── errorHandler.js   # Error handling middleware
├── utils/
│   ├── logger.js         # Winston logger setup
│   └── validation.js     # Validation utilities
├── logs/                 # Log files
├── server.js             # Main server file
├── Dockerfile           # Docker configuration
└── docker-compose.yml   # Docker Compose setup
\`\`\`

## 🔧 Environment Variables

Lihat `.env.example` untuk daftar lengkap environment variables yang diperlukan.

## 👥 Tim Pengembang

**Tim CC25-CF186 - Bangkit 2024**

### Machine Learning Team
- **Alfiah** (MC796D5X0076) - Politeknik Baja Tegal
- **Elaine Agustina** (MC834D5X1658) - Universitas Pelita Harapan  
- **Rafly Ashraffi Rachmat** (MC796D5Y0101) - Politeknik Baja Tegal

### Backend Team
- **Nasrun Hidayattullah** (FC327D5Y0383) - Universitas Teknologi Yogyakarta

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Proyek ini dikembangkan untuk keperluan edukasi sebagai bagian dari Capstone Project Bangkit 2024.

## ⚠️ Disclaimer

API ini dikembangkan untuk tujuan edukasi dan penelitian. Hasil prediksi tidak menggantikan diagnosis medis profesional. Selalu konsultasikan dengan dokter untuk pemeriksaan kesehatan yang akurat.

## 📞 Support

Untuk pertanyaan atau dukungan:
- Email: diabeacheck@bangkit.academy
- Tim ID: CC25-CF186
- GitHub Issues: [Create Issue](https://github.com/your-username/diabeacheck-backend/issues)
