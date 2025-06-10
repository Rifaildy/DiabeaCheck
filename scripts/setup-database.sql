-- Create database if not exists
CREATE DATABASE IF NOT EXISTS diabeacheck_db;
USE diabeacheck_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  profile_picture VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires DATETIME,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  login_attempts INT DEFAULT 0,
  locked_until DATETIME,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  session_token TEXT NOT NULL,
  refresh_token VARCHAR(255),
  device_info JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at DATETIME NOT NULL,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  blood_type VARCHAR(5),
  medical_conditions JSON,
  medications JSON,
  allergies JSON,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Prediction history table
CREATE TABLE IF NOT EXISTS prediction_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  prediction_id VARCHAR(100) UNIQUE NOT NULL,
  input_data JSON NOT NULL,
  prediction TINYINT NOT NULL,
  probability DECIMAL(5,4) NOT NULL,
  confidence DECIMAL(5,4),
  risk_level ENUM('Low', 'Moderate', 'High') NOT NULL,
  recommendations JSON,
  model_version VARCHAR(50),
  predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Health tips table
CREATE TABLE IF NOT EXISTS health_tips (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  name VARCHAR(100),
  email VARCHAR(255),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  rating INT,
  status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert sample health tips
INSERT INTO health_tips (title, description, category, icon) VALUES
('Pola Makan Sehat', 'Konsumsi makanan bergizi seimbang dengan porsi yang tepat', 'nutrition', '🥗'),
('Olahraga Teratur', 'Lakukan aktivitas fisik minimal 30 menit setiap hari', 'exercise', '🏃‍♂️'),
('Kontrol Berat Badan', 'Jaga berat badan ideal sesuai dengan BMI yang sehat', 'weight', '⚖️'),
('Pemeriksaan Rutin', 'Lakukan check-up kesehatan secara berkala', 'checkup', '🩺'),
('Kelola Stress', 'Praktikkan teknik relaksasi dan manajemen stress', 'mental', '🧘‍♀️'),
('Tidur Cukup', 'Tidur 7-8 jam setiap malam untuk pemulihan optimal', 'sleep', '😴');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token(255));
CREATE INDEX idx_predictions_user_id ON prediction_history(user_id);
CREATE INDEX idx_predictions_date ON prediction_history(predicted_at);
