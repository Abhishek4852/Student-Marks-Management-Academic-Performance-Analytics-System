# 5. Functional and Non-Functional Requirements

## Functional Requirements (FR)
- **FR-01 (Auth)**: The system shall allow Admins and Faculty to securely log in using token-based authentication.
- **FR-02 (Faculty Registration)**: Faculty can register, but accounts remain pending until Admin approval.
- **FR-03 (Batch Management)**: Admin shall create Degree Programs and Batches.
- **FR-04 (Excel Import)**: Admin shall upload an Excel file to bulk-import students, with a preview and validation step.
- **FR-05 (Semester & Subject)**: Admin shall create semesters and subjects (Theory, Lab, Viva) and assign approved faculty.
- **FR-06 (Enrollment)**: Admin shall bulk-enroll all students in a batch to a semester's subjects.
- **FR-07 (Marks Entry)**: Faculty shall view assigned subjects and enter marks for enrolled students.
- **FR-08 (Analytics)**: The system shall normalize marks to 100% and provide graphical analytics (class averages, highest scores).

## Non-Functional Requirements (NFR)
- **NFR-01 (Security)**: Passwords must be hashed. API endpoints must be protected by DRF permissions.
- **NFR-02 (Performance)**: API response times should be under 500ms.
- **NFR-03 (Usability)**: The UI must be responsive and built with Tailwind CSS.
- **NFR-04 (Reliability)**: The system must handle database transactions atomically (e.g., during bulk Excel imports).