# 4. Software Requirement Specification (SRS)

## 1. Introduction
This document specifies the requirements for the Student Marks Management & Academic Performance Analytics System.

## 2. Purpose
To define the functional and non-functional requirements to guide the development and testing phases.

## 3. Scope
The system will handle degree programs, batches, semesters, subjects, students, faculty assignments, marks entry, and analytics. 

## 4. User Classes and Characteristics
- **Admin**: Tech-savvy, requires high-level management tools.
- **Faculty**: Requires intuitive, error-free interfaces for data entry.

## 5. Operating Environment
- Client: Any modern web browser (Chrome, Firefox, Safari).
- Server: Python/Django environment (Linux/Unix/Windows), Node.js for Vite frontend.
- Database: SQLite (dev), PostgreSQL (prod).

## 6. Business Rules
- BR-01: A student cannot be enrolled in the same subject twice.
- BR-02: Faculty accounts must be approved by an Admin before login.
- BR-03: Theory marks consist of Internal 1, 2, 3 (20 each) and End Sem (60). Final = best 2 internals + end sem.
- BR-04: Lab marks consist of Test 1, 2 (20 each) and Final Viva (60). Final = sum of all.