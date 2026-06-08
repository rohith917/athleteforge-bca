-- ============================================================
-- Sample Data for Athlete Performance and Injury Tracking System
-- Default admin password: admin123 (hashed by Django on setup)
-- ============================================================

USE athlete_tracking_db;

-- Sample Athletes
INSERT INTO athletes (first_name, last_name, email, phone, date_of_birth, gender, sport, team, height_cm, address, emergency_contact, emergency_phone, status) VALUES
('Rahul', 'Sharma', 'rahul.sharma@email.com', '9876543210', '2001-03-15', 'Male', 'Athletics', 'Team Alpha', 178.50, '12 MG Road, Bangalore', 'Mrs. Sharma', '9876543211', 'Active'),
('Priya', 'Patel', 'priya.patel@email.com', '9876543212', '2002-07-22', 'Female', 'Swimming', 'Team Alpha', 165.00, '45 Park Street, Mumbai', 'Mr. Patel', '9876543213', 'Active'),
('Arjun', 'Singh', 'arjun.singh@email.com', '9876543214', '2000-11-08', 'Male', 'Football', 'Team Beta', 182.00, '78 Ring Road, Delhi', 'Mrs. Singh', '9876543215', 'Injured'),
('Sneha', 'Reddy', 'sneha.reddy@email.com', '9876543216', '2001-05-30', 'Female', 'Badminton', 'Team Beta', 168.00, '23 Lake View, Hyderabad', 'Mr. Reddy', '9876543217', 'Active'),
('Vikram', 'Kumar', 'vikram.kumar@email.com', '9876543218', '1999-12-12', 'Male', 'Cricket', 'Team Gamma', 175.00, '56 Stadium Road, Chennai', 'Mrs. Kumar', '9876543219', 'Active'),
('Ananya', 'Nair', 'ananya.nair@email.com', '9876543220', '2002-01-25', 'Female', 'Athletics', 'Team Gamma', 170.00, '89 Beach Road, Kochi', 'Mr. Nair', '9876543221', 'Active');

-- Sample Performance Records
INSERT INTO performance (athlete_id, record_date, speed_score, strength_score, endurance_score, flexibility_score, agility_score, speed_value, strength_value, endurance_value, flexibility_value, agility_value, notes) VALUES
(1, '2026-01-15', 85.50, 78.00, 82.00, 70.00, 88.00, 9.50, 120.00, 45.00, 160.00, 11.20, 'Good sprint performance'),
(1, '2026-02-15', 87.00, 80.00, 84.00, 72.00, 90.00, 9.80, 125.00, 48.00, 165.00, 10.80, 'Improved speed'),
(2, '2026-01-20', 75.00, 65.00, 92.00, 80.00, 70.00, 7.20, 45.00, 90.00, 175.00, 14.50, 'Excellent endurance'),
(2, '2026-02-20', 78.00, 68.00, 94.00, 82.00, 72.00, 7.50, 48.00, 95.00, 178.00, 14.00, 'Steady improvement'),
(3, '2026-01-10', 80.00, 85.00, 75.00, 65.00, 82.00, 8.50, 140.00, 40.00, 150.00, 12.00, 'Pre-injury baseline'),
(4, '2026-02-01', 70.00, 60.00, 68.00, 85.00, 75.00, 6.80, 35.00, 35.00, 180.00, 13.50, 'Good flexibility'),
(5, '2026-02-10', 72.00, 78.00, 70.00, 68.00, 76.00, 7.00, 110.00, 38.00, 155.00, 13.00, 'Consistent performer'),
(6, '2026-02-15', 88.00, 72.00, 86.00, 75.00, 85.00, 9.90, 95.00, 50.00, 168.00, 11.50, 'Top performer this month');

-- Sample Injuries
INSERT INTO injuries (athlete_id, injury_type, body_part, injury_date, severity, recovery_status, expected_recovery_date, medical_notes, treatment_plan) VALUES
(3, 'ACL Tear', 'Left Knee', '2026-01-25', 'Severe', 'Ongoing Treatment', '2026-07-25', 'MRI confirmed partial ACL tear. Requires physiotherapy.', '6 months rehab program with gradual return to play'),
(1, 'Hamstring Strain', 'Right Leg', '2026-02-05', 'Moderate', 'Recovering', '2026-03-05', 'Grade 2 hamstring strain during sprint training.', 'Rest, ice, compression, elevation for 4 weeks'),
(4, 'Ankle Sprain', 'Left Ankle', '2026-01-15', 'Minor', 'Recovered', '2026-02-01', 'Minor sprain during badminton match.', 'Completed rehab, cleared for full training');

-- Sample Competitions
INSERT INTO competitions (name, sport, venue, competition_date, level, description) VALUES
('State Athletics Championship 2026', 'Athletics', 'Kanteerava Stadium, Bangalore', '2026-02-20', 'State', 'Annual state level athletics championship'),
('National Swimming Meet 2026', 'Swimming', 'Aquatic Complex, Delhi', '2026-03-10', 'National', 'National level swimming competition'),
('Inter-College Football Tournament', 'Football', 'University Ground, Mumbai', '2026-01-30', 'Local', 'Local inter-college football tournament'),
('Badminton State Open', 'Badminton', 'Indoor Stadium, Hyderabad', '2026-02-28', 'State', 'State open badminton championship');

-- Sample Competition Results
INSERT INTO competition_results (competition_id, athlete_id, position, medal, score, notes) VALUES
(1, 1, 1, 'Gold', '10.45s - 100m', 'New personal best'),
(1, 6, 2, 'Silver', '10.62s - 100m', 'Strong finish'),
(2, 2, 3, 'Bronze', '2:05.30 - 200m Freestyle', 'Good performance'),
(3, 3, 5, 'None', 'Team reached semifinals', 'Injured during match'),
(4, 4, 1, 'Gold', 'Won finals 21-18, 21-15', 'Dominant performance');

-- Sample Attendance
INSERT INTO attendance (athlete_id, attendance_date, status, session_type, notes) VALUES
(1, '2026-03-01', 'Present', 'Training', 'Full session completed'),
(2, '2026-03-01', 'Present', 'Training', 'Full session completed'),
(3, '2026-03-01', 'Absent', 'Recovery', 'Injury recovery - excused'),
(4, '2026-03-01', 'Present', 'Training', 'Full session completed'),
(5, '2026-03-01', 'Late', 'Training', 'Arrived 15 minutes late'),
(6, '2026-03-01', 'Present', 'Training', 'Full session completed'),
(1, '2026-02-28', 'Present', 'Training', NULL),
(2, '2026-02-28', 'Present', 'Training', NULL),
(3, '2026-02-28', 'Absent', 'Recovery', NULL),
(4, '2026-02-28', 'Present', 'Training', NULL),
(5, '2026-02-28', 'Present', 'Training', NULL),
(6, '2026-02-28', 'Absent', 'Training', 'Sick leave');

-- Sample Weight Tracking
INSERT INTO weight_tracking (athlete_id, record_date, weight_kg, height_cm, bmi, body_fat_percentage, muscle_mass_kg, notes) VALUES
(1, '2026-01-01', 72.50, 178.50, 22.75, 12.50, 58.00, 'Baseline measurement'),
(1, '2026-02-01', 73.00, 178.50, 22.91, 12.00, 59.00, 'Slight weight gain - muscle'),
(2, '2026-01-01', 58.00, 165.00, 21.30, 18.00, 42.00, 'Baseline measurement'),
(2, '2026-02-01', 57.50, 165.00, 21.12, 17.50, 42.50, 'Lean mass maintained'),
(3, '2026-01-01', 78.00, 182.00, 23.54, 14.00, 62.00, 'Pre-injury weight'),
(4, '2026-01-01', 55.00, 168.00, 19.49, 16.00, 42.00, 'Baseline measurement'),
(5, '2026-01-01', 70.00, 175.00, 22.86, 15.00, 55.00, 'Baseline measurement'),
(6, '2026-01-01', 62.00, 170.00, 21.45, 13.00, 50.00, 'Baseline measurement');