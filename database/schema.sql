-- DiabeaCheck Database Schema
-- MySQL Database Structure for User Management and Prediction History

-- Create database
CREATE DATABASE IF NOT EXISTS diabeacheck_db;
USE diabeacheck_db;

-- Users table for authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    profile_picture VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires DATETIME,
    last_login DATETIME,
    login_attempts INT DEFAULT 0,
    locked_until DATETIME,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- User profiles table for additional information
CREATE TABLE user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    height DECIMAL(5,2), -- in cm
    weight DECIMAL(5,2), -- in kg
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    medical_conditions TEXT, -- JSON format for storing conditions
    medications TEXT, -- JSON format for storing medications
    allergies TEXT, -- JSON format for storing allergies
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    doctor_name VARCHAR(100),
    doctor_phone VARCHAR(20),
    insurance_provider VARCHAR(100),
    insurance_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Prediction history table
CREATE TABLE prediction_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id VARCHAR(100), -- for anonymous users
    
    -- Input data
    age INT NOT NULL,
    glucose DECIMAL(6,2) NOT NULL,
    blood_pressure DECIMAL(6,2) NOT NULL,
    skin_thickness DECIMAL(6,2),
    insulin DECIMAL(8,2),
    bmi DECIMAL(5,2) NOT NULL,
    diabetes_pedigree_function DECIMAL(8,6),
    pregnancies INT DEFAULT 0,
    
    -- Prediction results
    prediction_result TINYINT NOT NULL, -- 0 or 1
    probability DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    confidence DECIMAL(5,4) NOT NULL,
    risk_level ENUM('Low', 'Moderate', 'High') NOT NULL,
    
    -- Model information
    model_version VARCHAR(50) DEFAULT '1.0.0',
    model_accuracy DECIMAL(5,4),
    
    -- Additional metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSON,
    location_data JSON, -- city, country if available
    
    -- Timestamps
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_predicted_at (predicted_at),
    INDEX idx_risk_level (risk_level),
    INDEX idx_prediction_result (prediction_result)
);

-- Health metrics tracking table
CREATE TABLE health_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    
    -- Vital signs
    systolic_bp INT,
    diastolic_bp INT,
    heart_rate INT,
    temperature DECIMAL(4,2),
    oxygen_saturation DECIMAL(5,2),
    
    -- Blood tests
    fasting_glucose DECIMAL(6,2),
    random_glucose DECIMAL(6,2),
    hba1c DECIMAL(4,2),
    cholesterol_total DECIMAL(6,2),
    cholesterol_ldl DECIMAL(6,2),
    cholesterol_hdl DECIMAL(6,2),
    triglycerides DECIMAL(6,2),
    
    -- Physical measurements
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    waist_circumference DECIMAL(5,2),
    hip_circumference DECIMAL(5,2),
    
    -- Notes and observations
    notes TEXT,
    symptoms JSON,
    medications_taken JSON,
    
    -- Metadata
    recorded_by ENUM('user', 'doctor', 'nurse', 'system') DEFAULT 'user',
    source VARCHAR(100), -- device, manual entry, etc.
    verified BOOLEAN DEFAULT FALSE,
    
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_recorded_at (recorded_at),
    INDEX idx_recorded_by (recorded_by)
);

-- Feedback table (enhanced)
CREATE TABLE feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    prediction_id INT,
    
    name VARCHAR(100),
    email VARCHAR(255),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    category ENUM('general', 'prediction', 'ui', 'performance', 'suggestion', 'bug_report'),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    
    -- Follow-up information
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_completed BOOLEAN DEFAULT FALSE,
    admin_response TEXT,
    admin_responded_by INT,
    admin_responded_at TIMESTAMP NULL,
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    status ENUM('received', 'in_review', 'resolved', 'closed') DEFAULT 'received',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (prediction_id) REFERENCES prediction_history(id) ON DELETE SET NULL,
    FOREIGN KEY (admin_responded_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_prediction_id (prediction_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
);

-- Health tips table (for dynamic content management)
CREATE TABLE health_tips (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    category ENUM('nutrition', 'exercise', 'weight', 'checkup', 'lifestyle', 'monitoring') NOT NULL,
    tags JSON,
    
    -- Targeting
    target_risk_level ENUM('Low', 'Moderate', 'High', 'All') DEFAULT 'All',
    target_age_min INT,
    target_age_max INT,
    target_gender ENUM('male', 'female', 'all') DEFAULT 'all',
    
    -- Content metadata
    author VARCHAR(100),
    medical_reviewer VARCHAR(100),
    sources TEXT, -- JSON array of sources
    last_reviewed DATE,
    
    -- Display settings
    featured BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    icon VARCHAR(50),
    image_url VARCHAR(500),
    
    -- Status
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_featured (featured),
    INDEX idx_target_risk_level (target_risk_level)
);

-- User sessions table for authentication
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    device_info JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_active (is_active)
);

-- Audit log table for tracking important actions
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- users, predictions, etc.
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at)
);

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('prediction_reminder', 'health_tip', 'system_update', 'security_alert') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSON, -- additional data for the notification
    
    read_at TIMESTAMP NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Insert default health tips
INSERT INTO health_tips (title, description, content, category, status, published_at) VALUES
('Pola Makan Sehat untuk Diabetes', 'Tips nutrisi untuk mencegah dan mengelola diabetes', 
'Konsumsi makanan bergizi seimbang dengan porsi yang tepat. Perbanyak sayuran hijau, buah-buahan, dan protein tanpa lemak. Batasi konsumsi gula dan karbohidrat sederhana.', 
'nutrition', 'published', NOW()),

('Olahraga Rutin untuk Kesehatan', 'Pentingnya aktivitas fisik dalam pencegahan diabetes', 
'Lakukan aktivitas fisik minimal 150 menit per minggu. Kombinasikan latihan kardio dengan latihan kekuatan. Mulai dengan intensitas ringan dan tingkatkan secara bertahap.', 
'exercise', 'published', NOW()),

('Monitoring Gula Darah', 'Cara memantau kadar gula darah secara mandiri', 
'Periksa gula darah secara rutin sesuai anjuran dokter. Catat hasil pemeriksaan dan perhatikan pola perubahan. Konsultasikan hasil dengan tenaga medis.', 
'monitoring', 'published', NOW());

-- Create views for common queries
CREATE VIEW user_prediction_summary AS
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(ph.id) as total_predictions,
    AVG(ph.probability) as avg_risk_probability,
    MAX(ph.predicted_at) as last_prediction_date,
    SUM(CASE WHEN ph.risk_level = 'High' THEN 1 ELSE 0 END) as high_risk_count,
    SUM(CASE WHEN ph.risk_level = 'Moderate' THEN 1 ELSE 0 END) as moderate_risk_count,
    SUM(CASE WHEN ph.risk_level = 'Low' THEN 1 ELSE 0 END) as low_risk_count
FROM users u
LEFT JOIN prediction_history ph ON u.id = ph.user_id
GROUP BY u.id, u.email, u.first_name, u.last_name;

CREATE VIEW recent_predictions AS
SELECT 
    ph.*,
    u.email,
    u.first_name,
    u.last_name
FROM prediction_history ph
JOIN users u ON ph.user_id = u.id
WHERE ph.predicted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY ph.predicted_at DESC;

-- Create stored procedures for common operations
DELIMITER //

-- Procedure to get user prediction history with pagination
CREATE PROCEDURE GetUserPredictionHistory(
    IN p_user_id INT,
    IN p_limit INT DEFAULT 10,
    IN p_offset INT DEFAULT 0
)
BEGIN
    SELECT 
        ph.*,
        CASE 
            WHEN ph.probability < 0.3 THEN 'Rendah'
            WHEN ph.probability < 0.7 THEN 'Sedang'
            ELSE 'Tinggi'
        END as risk_level_indonesian
    FROM prediction_history ph
    WHERE ph.user_id = p_user_id
    ORDER BY ph.predicted_at DESC
    LIMIT p_limit OFFSET p_offset;
    
    -- Also return total count
    SELECT COUNT(*) as total_count
    FROM prediction_history ph
    WHERE ph.user_id = p_user_id;
END //

-- Procedure to clean up expired sessions
CREATE PROCEDURE CleanupExpiredSessions()
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR last_activity < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    SELECT ROW_COUNT() as deleted_sessions;
END //

-- Procedure to get user dashboard data
CREATE PROCEDURE GetUserDashboard(IN p_user_id INT)
BEGIN
    -- User basic info
    SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.last_login,
        up.height,
        up.weight,
        CASE 
            WHEN up.height > 0 AND up.weight > 0 
            THEN ROUND(up.weight / POWER(up.height/100, 2), 2)
            ELSE NULL 
        END as current_bmi
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.id = p_user_id;
    
    -- Recent predictions summary
    SELECT 
        COUNT(*) as total_predictions,
        AVG(probability) as avg_probability,
        MAX(predicted_at) as last_prediction,
        SUM(CASE WHEN risk_level = 'High' THEN 1 ELSE 0 END) as high_risk_count,
        SUM(CASE WHEN risk_level = 'Moderate' THEN 1 ELSE 0 END) as moderate_risk_count,
        SUM(CASE WHEN risk_level = 'Low' THEN 1 ELSE 0 END) as low_risk_count
    FROM prediction_history
    WHERE user_id = p_user_id;
    
    -- Recent health metrics
    SELECT *
    FROM health_metrics
    WHERE user_id = p_user_id
    ORDER BY recorded_at DESC
    LIMIT 5;
    
    -- Unread notifications count
    SELECT COUNT(*) as unread_notifications
    FROM notifications
    WHERE user_id = p_user_id AND is_read = FALSE;
END //

DELIMITER ;

-- Create triggers for audit logging
DELIMITER //

CREATE TRIGGER users_audit_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
    VALUES (NEW.id, 'CREATE', 'users', NEW.id, JSON_OBJECT(
        'email', NEW.email,
        'first_name', NEW.first_name,
        'last_name', NEW.last_name,
        'status', NEW.status
    ));
END //

CREATE TRIGGER users_audit_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (NEW.id, 'UPDATE', 'users', NEW.id, 
        JSON_OBJECT(
            'email', OLD.email,
            'first_name', OLD.first_name,
            'last_name', OLD.last_name,
            'status', OLD.status
        ),
        JSON_OBJECT(
            'email', NEW.email,
            'first_name', NEW.first_name,
            'last_name', NEW.last_name,
            'status', NEW.status
        )
    );
END //

CREATE TRIGGER prediction_history_audit
AFTER INSERT ON prediction_history
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
    VALUES (NEW.user_id, 'PREDICTION', 'prediction_history', NEW.id, JSON_OBJECT(
        'prediction_result', NEW.prediction_result,
        'probability', NEW.probability,
        'risk_level', NEW.risk_level
    ));
END //

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_prediction_history_composite ON prediction_history(user_id, predicted_at DESC);
CREATE INDEX idx_health_metrics_composite ON health_metrics(user_id, recorded_at DESC);
CREATE INDEX idx_notifications_composite ON notifications(user_id, is_read, created_at DESC);

-- Create a function to calculate BMI
DELIMITER //
CREATE FUNCTION CalculateBMI(weight DECIMAL(5,2), height DECIMAL(5,2))
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE bmi DECIMAL(5,2);
    
    IF weight IS NULL OR height IS NULL OR height = 0 THEN
        RETURN NULL;
    END IF;
    
    SET bmi = weight / POWER(height/100, 2);
    RETURN ROUND(bmi, 2);
END //
DELIMITER ;
