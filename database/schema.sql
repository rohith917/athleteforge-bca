-- ============================================================
-- Athlete Performance and Injury Tracking System
-- MySQL Database Schema
-- BCA Final Year Project
-- ============================================================

CREATE DATABASE IF NOT EXISTS athlete_tracking_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE athlete_tracking_db;

-- ------------------------------------------------------------
-- Users table (Admin authentication)
-- Maps to Django's auth_user table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(254) DEFAULT '',
    first_name VARCHAR(150) DEFAULT '',
    last_name VARCHAR(150) DEFAULT '',
    is_staff TINYINT(1) DEFAULT 1,
    is_active TINYINT(1) DEFAULT 1,
    is_superuser TINYINT(1) DEFAULT 0,
    date_joined DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Athletes table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS athletes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(254) DEFAULT '',
    phone VARCHAR(20) DEFAULT '',
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL DEFAULT 'Male',
    sport VARCHAR(100) NOT NULL,
    team VARCHAR(100) DEFAULT '',
    height_cm DECIMAL(5,2) DEFAULT NULL COMMENT 'Height in centimeters',
    address TEXT,
    emergency_contact VARCHAR(100) DEFAULT '',
    emergency_phone VARCHAR(20) DEFAULT '',
    status ENUM('Active', 'Inactive', 'Injured') DEFAULT 'Active',
    photo VARCHAR(255) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_athlete_name (last_name, first_name),
    INDEX idx_athlete_sport (sport),
    INDEX idx_athlete_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Performance tracking table
-- Records speed, strength, endurance, flexibility, agility
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    record_date DATE NOT NULL,
    speed_score DECIMAL(6,2) DEFAULT NULL COMMENT 'Speed score (0-100)',
    strength_score DECIMAL(6,2) DEFAULT NULL COMMENT 'Strength score (0-100)',
    endurance_score DECIMAL(6,2) DEFAULT NULL COMMENT 'Endurance score (0-100)',
    flexibility_score DECIMAL(6,2) DEFAULT NULL COMMENT 'Flexibility score (0-100)',
    agility_score DECIMAL(6,2) DEFAULT NULL COMMENT 'Agility score (0-100)',
    speed_value DECIMAL(8,2) DEFAULT NULL COMMENT 'Actual speed measurement (m/s)',
    strength_value DECIMAL(8,2) DEFAULT NULL COMMENT 'Actual strength (kg)',
    endurance_value DECIMAL(8,2) DEFAULT NULL COMMENT 'Endurance time (minutes)',
    flexibility_value DECIMAL(8,2) DEFAULT NULL COMMENT 'Flexibility angle (degrees)',
    agility_value DECIMAL(8,2) DEFAULT NULL COMMENT 'Agility time (seconds)',
    notes TEXT,
    recorded_by INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    INDEX idx_performance_athlete (athlete_id),
    INDEX idx_performance_date (record_date)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Injuries table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS injuries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    injury_type VARCHAR(150) NOT NULL,
    body_part VARCHAR(100) NOT NULL,
    injury_date DATE NOT NULL,
    severity ENUM('Minor', 'Moderate', 'Severe') DEFAULT 'Minor',
    recovery_status ENUM('Recovering', 'Recovered', 'Ongoing Treatment') DEFAULT 'Recovering',
    expected_recovery_date DATE DEFAULT NULL,
    actual_recovery_date DATE DEFAULT NULL,
    medical_notes TEXT,
    treatment_plan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    INDEX idx_injury_athlete (athlete_id),
    INDEX idx_injury_status (recovery_status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Competitions table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS competitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sport VARCHAR(100) NOT NULL,
    venue VARCHAR(200) DEFAULT '',
    competition_date DATE NOT NULL,
    level ENUM('Local', 'State', 'National', 'International') DEFAULT 'Local',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_competition_date (competition_date)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Competition results (medal tracking)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS competition_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    competition_id INT NOT NULL,
    athlete_id INT NOT NULL,
    position INT DEFAULT NULL,
    medal ENUM('Gold', 'Silver', 'Bronze', 'None') DEFAULT 'None',
    score VARCHAR(100) DEFAULT '',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    INDEX idx_result_competition (competition_id),
    INDEX idx_result_athlete (athlete_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Attendance table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late', 'Excused') DEFAULT 'Present',
    session_type ENUM('Training', 'Competition', 'Recovery', 'Other') DEFAULT 'Training',
    notes TEXT,
    marked_by INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (athlete_id, attendance_date, session_type),
    INDEX idx_attendance_date (attendance_date)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Weight tracking table (includes BMI and body fat)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weight_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    record_date DATE NOT NULL,
    weight_kg DECIMAL(6,2) NOT NULL,
    height_cm DECIMAL(5,2) NOT NULL,
    bmi DECIMAL(5,2) DEFAULT NULL COMMENT 'Auto-calculated BMI',
    body_fat_percentage DECIMAL(5,2) DEFAULT NULL,
    muscle_mass_kg DECIMAL(6,2) DEFAULT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    INDEX idx_weight_athlete (athlete_id),
    INDEX idx_weight_date (record_date)
) ENGINE=InnoDB;