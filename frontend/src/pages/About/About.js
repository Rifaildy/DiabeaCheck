import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeartbeat,
  faUsers,
  faBrain,
  faChartLine,
  faShieldAlt,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

const About = () => {
  const teamMembers = [
    {
      name: "Alfiah",
      id: "MC796D5X0076",
      role: "Machine Learning",
      institution: "Politeknik Baja Tegal",
      responsibilities: "Preprocessing Data, Training Model ML, Evaluasi Model",
    },
    {
      name: "Elaine Agustina",
      id: "MC834D5X1658",
      role: "Machine Learning",
      institution: "Universitas Pelita Harapan",
      responsibilities:
        "Feature Selection, Tuning Hyperparameter, Integrasi Model ke API",
    },
    {
      name: "Rafly Ashraffi Rachmat",
      id: "MC796D5Y0101",
      role: "Machine Learning",
      institution: "Politeknik Baja Tegal",
      responsibilities:
        "Dokumentasi ML, Eksperimen Model Alternatif, Validasi dan Testing Akurasi Model",
    },
    {
      name: "Ilham Bintang Prakoso",
      id: "FC327D5Y1041",
      role: "Fullstack Developer",
      institution: "Universitas Teknologi Yogyakarta",
      responsibilities: "UI/UX Design, Pengembangan Frontend & Backend Pengujian Aplikasi, Deployment Web App",
    },
    {
      name: "Nasrun Hidayattullah",
      id: "FC327D5Y0383",
      role: "Fullstack Developer",
      institution: "Universitas Teknologi Yogyakarta",
      responsibilities:
        "UI/UX Design, Pengembangan Frontend & Backend Pengujian Aplikasi, Deployment Web App",
    },
    {
      name: "Rifaildy Nurhuda Assalam",
      id: "FC327D5Y0431",
      role: "Fullstack Developer",
      institution: "Universitas Teknologi Yogyakarta",
      responsibilities: "UI/UX Design, Pengembangan Frontend & Backend Pengujian Aplikasi, Deployment Web App",
    },
  ];

  const technologies = [
    {
      category: "Frontend",
      items: [
        "React.js",
        "Tailwind CSS",
        "React Router",
        "Axios",
        "Font Awesome",
      ],
    },
    {
      category: "Backend",
      items: ["Node.js", "Express.js", "MySQL", "RESTful API"],
    },
    {
      category: "Machine Learning",
      items: ["Python", "Scikit-learn", "Random Forest", "Pandas", "NumPy"],
    },
    {
      category: "Tools",
      items: ["VS Code", "Git", "GitHub", "Docker", "Google Colab"],
    },
  ];

  const features = [
    {
      icon: faBrain,
      title: "Machine Learning",
      description:
        "Menggunakan algoritma Random Forest untuk prediksi yang akurat",
    },
    {
      icon: faChartLine,
      title: "Analisis Real-time",
      description: "Hasil prediksi langsung tersedia setelah input data",
    },
    {
      icon: faShieldAlt,
      title: "Keamanan Data",
      description: "Data tidak disimpan permanen, menjaga privasi pengguna",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FontAwesomeIcon
            icon={faHeartbeat}
            className="h-16 w-16 text-blue-200 mb-6"
          />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Tentang DiabeaCheck
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Sistem berbasis web untuk deteksi risiko penyakit diabetes
            menggunakan teknologi Machine Learning yang dikembangkan oleh Tim
            CC25-CF186
          </p>
        </div>
      </section>

      {/* Project Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Latar Belakang Proyek
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Mengapa DiabeaCheck?
              </h3>
              <p className="text-gray-600 mb-6">
                Berdasarkan data IDF tahun 2021, 10,8% populasi dewasa
                Indonesia—sekitar 19,5 juta orang—mengidap diabetes. Angka ini
                menempatkan Indonesia di peringkat kelima dunia dalam jumlah
                penderita diabetes.
              </p>
              <p className="text-gray-600 mb-6">
                Tingginya prevalensi ini, ditambah dengan rendahnya kesadaran
                masyarakat terhadap faktor risiko, mendorong kami untuk
                menciptakan solusi berbasis teknologi yang dapat membantu
                deteksi dini risiko diabetes.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">10.8%</div>
                  <div className="text-sm text-gray-600">Populasi Dewasa</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">19.5M</div>
                  <div className="text-sm text-gray-600">Penderita</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">#5</div>
                  <div className="text-sm text-gray-600">Ranking Dunia</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <FontAwesomeIcon
                      icon={feature.icon}
                      className="h-8 w-8 text-blue-600 mr-3"
                    />
                    <h4 className="text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h4>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tim Pengembang
            </h2>
            <p className="text-xl text-gray-600">
              Tim CC25-CF186 - Capstone Project Bangkit 2024
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="h-8 w-8 text-blue-600"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium">{member.role}</p>
                  <p className="text-sm text-gray-500">{member.id}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <FontAwesomeIcon
                      icon={faGraduationCap}
                      className="h-4 w-4 text-gray-400 mr-2"
                    />
                    <span className="text-gray-600">{member.institution}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Tanggung Jawab:</strong>
                    <p className="mt-1">{member.responsibilities}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Teknologi yang Digunakan
            </h2>
            <p className="text-xl text-gray-600">
              Stack teknologi modern untuk performa optimal
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technologies.map((tech, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  {tech.category}
                </h3>
                <ul className="space-y-2">
                  {tech.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-600 text-center">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Timeline Pengembangan
            </h2>
          </div>
          <div className="space-y-8">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Minggu 1-2: Data & Model Development
                </h3>
                <p className="text-gray-600">
                  Pengumpulan dataset, preprocessing, dan pengembangan model
                  Machine Learning
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Minggu 3-4: Web Development
                </h3>
                <p className="text-gray-600">
                  Pengembangan frontend dan backend, integrasi API dengan model
                  ML
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Minggu 5-6: Testing & Documentation
                </h3>
                <p className="text-gray-600">
                  Pengujian sistem, dokumentasi, dan finalisasi proyek
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Hubungi Tim Kami
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Untuk informasi lebih lanjut tentang proyek DiabeaCheck
          </p>
          <div className="text-blue-100">
            <p>Email: diabeacheck@bangkit.academy</p>
            <p>Tim ID: CC25-CF186</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
