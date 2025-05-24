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
