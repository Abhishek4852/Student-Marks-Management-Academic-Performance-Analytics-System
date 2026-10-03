# 13. API Documentation

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login/` | POST | Public | Returns auth token and role. |
| `/api/faculty/register/` | POST | Public | Creates pending faculty account. |
| `/api/faculty/{id}/approve/` | PATCH | Admin | Approves a faculty account. |
| `/api/students/import/preview/` | POST | Admin | Previews Excel data. |
| `/api/semesters/{id}/enroll-all/` | POST | Admin | Bulk enrolls batch to semester. |
| `/api/subjects/{id}/marks/` | GET/POST | Faculty | Fetch/Update marks for assigned subject. |
| `/api/subjects/{id}/analytics/` | GET | Admin/Fac | Returns normalized analytics data. |