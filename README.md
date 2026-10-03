# Student Marks Management & Academic Performance Analytics System

This project is a comprehensive system for managing student marks, tracking academic performance, and generating analytics.

## Backend (Django + DRF)
- Runs on port `8000`.
- Manages users, batches, semesters, subjects, students, enrollments, and marks.
- Features API token authentication.

## Frontend (React + Vite + TailwindCSS)
- Runs on port `5173`.
- Contains specialized dashboards for Admins and Faculty members.

---

## 🔐 System Credentials

### Admin Login
- **Username**: `admin`
- **Password**: `admin123`

### Faculty Accounts (Semester 9)
All faculty members listed below have been pre-registered, assigned to their respective subjects, and pre-approved.

| Subject | Faculty Name | Username | Password |
| :--- | :--- | :--- | :--- |
| Object Oriented Analysis & Design | Dr. Ramesh Thakur | `ramesh` | `password123` |
| Multimedia Systems | Dr. Jugendra Dongre | `jugendra` | `password123` |
| Compiler Design | Dr. Yasmin Shaikh | `yasmin` | `password123` |
| Cloud Computing | Dr. Vivek Shrivastav | `vivek` | `password123` |
| ITPM | Dr. Kirti Mathur | `kirti` | `password123` |
| OOAD Lab | Mr. Brajesh Vijaypuriya | `brajesh` | `password123` |
| Multimedia Systems Lab | Ms. Gurpreet Kaur | `gurpreet` | `password123` |

## Getting Started
To test the flow:
1. Log in as an **Admin** to oversee the system, add more batches, or approve new faculty.
2. Log in as any of the **Faculty** (e.g. `ramesh`) to see their assigned subjects and view/edit the populated student marks!
