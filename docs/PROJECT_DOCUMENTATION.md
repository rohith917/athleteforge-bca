# Project Documentation

## Athlete Performance and Injury Tracking System

**Submitted by:** [Your Name]  
**Course:** BCA (Bachelor of Computer Applications)  
**Institution:** [Your College Name]  
**Academic Year:** 2025-2026

---

## 1. Introduction

### 1.1 Problem Statement

Sports academies and coaching centers need a centralized system to track athlete performance metrics, monitor injuries, manage competitions, and maintain attendance records. Manual record-keeping is error-prone and makes it difficult to analyze trends.

### 1.2 Objectives

- Develop a web-based system for athlete data management
- Track performance across five key metrics
- Monitor injuries and recovery progress
- Manage competitions and medal achievements
- Generate reports in PDF and Excel formats
- Provide visual analytics through dashboard charts

### 1.3 Scope

The system is designed for sports academy administrators to manage athlete data. It supports CRUD operations, reporting, and data visualization.

---

## 2. System Analysis

### 2.1 Existing System

Manual paper-based records or basic spreadsheets without integrated analytics.

### 2.2 Proposed System

A modern three-tier web application:
- **Presentation Layer:** React.js with Bootstrap
- **Business Logic Layer:** Django REST Framework
- **Data Layer:** MySQL Database

### 2.3 Feasibility Study

| Factor       | Assessment                                    |
|--------------|-----------------------------------------------|
| Technical    | Feasible with open-source technologies        |
| Economic     | Low cost — all tools are free/open-source     |
| Operational  | Easy to use with intuitive UI                 |

---

## 3. System Design

### 3.1 Architecture Diagram

```
┌─────────────┐     HTTP/REST API     ┌─────────────┐     SQL      ┌──────────┐
│   React     │ ◄──────────────────► │   Django    │ ◄──────────► │  MySQL   │
│  Frontend   │   Session Auth + CSRF  │   Backend   │              │ Database │
│ (Port 5173) │                       │ (Port 8000) │              │          │
└─────────────┘                       └─────────────┘              └──────────┘
```

### 3.2 ER Diagram (Entity Relationships)

```
Users (1) ──── manages ──── (N) Athletes
Athletes (1) ──── has ──── (N) Performance
Athletes (1) ──── has ──── (N) Injuries
Athletes (1) ──── has ──── (N) Attendance
Athletes (1) ──── has ──── (N) WeightTracking
Athletes (1) ──── participates ──── (N) CompetitionResults
Competitions (1) ──── has ──── (N) CompetitionResults
```

### 3.3 Database Schema

See `database/schema.sql` for complete table definitions.

### 3.4 Module Description

| Module       | Functions                                              |
|--------------|--------------------------------------------------------|
| Auth         | Login, Logout, Session validation                      |
| Athletes     | CRUD, Search, Profile view                             |
| Performance  | Record 5 metrics, History, Dashboard charts            |
| Injuries     | Add, Update recovery, Medical notes                    |
| Competitions | Add events, Store results, Medal tracking            |
| Attendance   | Bulk marking, Reports with statistics                  |
| Weight       | Weight records, BMI calculator, Body fat tracking      |
| Dashboard    | Statistics cards, Chart.js graphs                      |
| Reports      | PDF and Excel export                                   |

---

## 4. Implementation

### 4.1 Backend (Django)

- **Models:** ORM models mapping to MySQL tables
- **Serializers:** DRF serializers for JSON conversion
- **ViewSets:** RESTful CRUD endpoints
- **Authentication:** Django session-based auth
- **Reports:** ReportLab for PDF, OpenPyXL for Excel

### 4.2 Frontend (React)

- **Routing:** React Router v6 with protected routes
- **State:** React Context for authentication
- **API Layer:** Axios with CSRF token handling
- **UI:** Bootstrap 5 responsive components
- **Charts:** Chart.js via react-chartjs-2

### 4.3 Key Algorithms

**BMI Calculation:**
```
BMI = weight (kg) / (height (m))²

Categories:
  BMI < 18.5  → Underweight
  18.5 ≤ BMI < 25 → Normal
  25 ≤ BMI < 30   → Overweight
  BMI ≥ 30        → Obese
```

**Attendance Rate:**
```
Rate = (Present Count / Total Records) × 100
```

---

## 5. Testing

| Test Case              | Expected Result                    | Status |
|------------------------|------------------------------------|--------|
| Admin Login            | Redirect to dashboard              | Pass   |
| Add Athlete            | Athlete appears in list            | Pass   |
| Search Athlete         | Filtered results displayed         | Pass   |
| Record Performance     | Data saved and shown in chart      | Pass   |
| Add Injury             | Injury listed with status          | Pass   |
| Update Recovery        | Status changes to selected value   | Pass   |
| Mark Attendance        | Bulk records created               | Pass   |
| BMI Calculator         | Correct BMI and category returned  | Pass   |
| PDF Report             | PDF file downloads                 | Pass   |
| Excel Export           | XLSX file downloads                | Pass   |

---

## 6. Future Enhancements

- Mobile app (React Native)
- Coach/Athlete role-based access
- Email notifications for injury recovery
- Integration with wearable fitness devices
- Machine learning for injury prediction

---

## 7. Conclusion

The Athlete Performance and Injury Tracking System successfully provides a comprehensive solution for sports academy management. It demonstrates full-stack development skills using React, Django, and MySQL with modern web development practices.

---

## 8. References

1. Django Documentation — https://docs.djangoproject.com/
2. React Documentation — https://react.dev/
3. Django REST Framework — https://www.django-rest-framework.org/
4. Chart.js Documentation — https://www.chartjs.org/
5. Bootstrap 5 — https://getbootstrap.com/
6. MySQL Documentation — https://dev.mysql.com/doc/