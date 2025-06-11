import { HeartPulse, Mail, Phone, Github, Linkedin } from "lucide-react"; // Changed from FontAwesome to Lucide React icons

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white font-inter"> {/* Added font-inter class */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <HeartPulse className="h-8 w-8 text-blue-400" /> {/* Replaced FontAwesomeIcon with HeartPulse */}
              <span className="text-2xl font-bold">DiabeaCheck</span>
            </div>
            <p className="text-gray-300 mb-4">
              Sistem berbasis web untuk deteksi risiko penyakit diabetes menggunakan teknologi Machine Learning.
              Membantu deteksi dini untuk pencegahan yang lebih baik.
            </p>
            <div className="flex space-x-4">
              {/* GitHub Link for Alpii21 */}
              <a
                href="https://github.com/Alpii21/Capstonediabeacheck#" // Updated GitHub link
                className="text-gray-300 hover:text-blue-400 transition-colors"
                aria-label="GitHub Repository 1"
              >
                <Github className="h-6 w-6" />
              </a>
              {/* GitHub Link for Rifaildy */}
              <a
                href="https://github.com/Rifaildy/DiabeaCheck" // Added second GitHub link
                className="text-gray-300 hover:text-blue-400 transition-colors"
                aria-label="GitHub Repository 2"
              >
                <Github className="h-6 w-6" />
              </a>
              {/* LinkedIn Link - Placeholder as no new LinkedIn link was provided */}
              <a
                href="https://linkedin.com/in/your-profile" // Remember to update this link if you have a specific one
                className="text-gray-300 hover:text-blue-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Beranda
                </a>
              </li>
              <li>
                <a href="/prediction" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Prediksi Diabetes
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Tentang Kami
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" /> {/* Replaced FontAwesomeIcon with Mail */}
                <span className="text-gray-300">ilhambintangprakoso@gmail.com</span> {/* Updated email */}
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" /> {/* Replaced FontAwesomeIcon with Phone */}
                <span className="text-gray-300">+62 895-3867-84050</span> {/* Updated phone number */}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">© 2025 DiabeaCheck. Dikembangkan oleh Tim CC25-CF186. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
