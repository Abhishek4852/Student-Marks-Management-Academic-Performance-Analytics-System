# 1. Project Overview

## Project Title
**Semester-wise Student Marks Management & Academic Performance Analytics System**

## Background and Context
In many educational institutions, managing student academic records, assigning faculty, and computing performance analytics is handled via fragmented spreadsheets or outdated desktop applications. This leads to data silos, manual calculation errors, and a lack of real-time insights for administrators and teachers.

## Existing System and its Limitations
The current manual or semi-automated systems suffer from:
- Lack of centralized database storage.
- High risk of data duplication and manual errors in marks entry.
- Inability to quickly generate semester-wise or subject-wise analytics.
- Time-consuming processes for onboarding student data (batch-wise).
- No role-based access control for faculty to enter marks securely.

## Proposed Solution
A web-based Object-Oriented system built with a React frontend and Django REST API backend. It provides centralized data storage (SQLite/PostgreSQL), secure role-based access for Admins and Faculty, automated batch onboarding via Excel, and real-time performance analytics.

## Project Objectives
- Centralize student and marks data.
- Automate marks calculations based on predefined rules.
- Provide interactive analytics dashboards for both Faculty and Admin.
- Reduce administrative overhead by enabling bulk Excel imports.

## Project Scope
The system covers Degree Programs, Batches, Semesters, Subjects, Students, Enrollments, and Marks entry. It includes two primary user roles: Admin and Faculty. Students do not have direct access.

## Expected Outcomes and Benefits
- 100% elimination of manual calculation errors.
- Drastic reduction in time required for batch onboarding.
- Real-time visibility into academic performance.