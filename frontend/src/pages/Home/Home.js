import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeartbeat,
  faUserMd,
  faChartLine,
  faShieldAlt,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  const features = [
    {
      icon: faUserMd,
      title: "Deteksi Dini",
      description:
        "Sistem prediksi risiko diabetes menggunakan data medis Anda",
    },
    {
      icon: faChartLine,
      title: "Machine Learning",
      description: "Teknologi AI canggih dengan algoritma Random Forest",
    },
    {
      icon: faShieldAlt,
      title: "Aman & Privat",
      description: "Data Anda aman dan tidak disimpan secara permanen",
    },
  ];

  const stats = [
    { number: "10.8%", label: "Populasi dewasa Indonesia dengan diabetes" },
    { number: "19.5M", label: "Penderita diabetes di Indonesia" },
    { number: "#5", label: "Peringkat Indonesia di dunia" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Deteksi Risiko
                <span className="text-blue-200"> Diabetes</span>
                <br />
                Lebih Awal
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Gunakan teknologi Machine Learning untuk mendeteksi risiko
                diabetes Anda secara cepat, akurat, dan mudah diakses kapan
                saja.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/prediction"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
                >
                  Mulai Prediksi
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </Link>
                <Link
                  to="/about"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
                >
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md">
                <FontAwesomeIcon
                  icon={faHeartbeat}
                  className="h-32 w-32 text-blue-200 mx-auto mb-4"
                />
                <h3 className="text-2xl font-semibold text-center mb-2">
                  DiabeaCheck
                </h3>
                <p className="text-blue-100 text-center">
                  Sistem prediksi diabetes berbasis AI untuk deteksi dini yang
                  lebih baik
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mengapa Deteksi Dini Penting?
            </h2>
            <p className="text-xl text-gray-600">
              Data menunjukkan tingginya prevalensi diabetes di Indonesia
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-gray-600">
              Teknologi terdepan untuk kesehatan Anda
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-blue-600 mb-4">
                  <FontAwesomeIcon icon={feature.icon} className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cara Kerja
            </h2>
            <p className="text-xl text-gray-600">
              Proses sederhana dalam 3 langkah
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Input Data Medis
              </h3>
              <p className="text-gray-600">
                Masukkan data seperti usia, kadar glukosa, tekanan darah, dan
                BMI
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analisis AI
              </h3>
              <p className="text-gray-600">
                Sistem menganalisis data menggunakan algoritma Machine Learning
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Hasil Prediksi
              </h3>
              <p className="text-gray-600">
                Dapatkan hasil prediksi risiko diabetes dan rekomendasi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Mulai Deteksi Risiko Diabetes Anda Sekarang
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Deteksi dini adalah kunci pencegahan yang lebih baik
          </p>
          <Link
            to="/prediction"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center"
          >
            Mulai Prediksi Sekarang
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
