# 8. Database Design

## Entities
1. **User**: Authentication and authorization.
2. **DegreeProgram**: BCE+MCA, B.Tech+M.Tech.
3. **Batch**: 2022-2027.
4. **Student**: roll_number, name, enrollment_number, batch_id.
5. **Semester**: semester_number, name, batch_id.
6. **Subject**: subject_code, name, type, semester_id, assigned_faculty_id.
7. **Enrollment**: student_id, subject_id.
8. **Marks**: Tracks all internal and end-sem marks. unique_together(student, subject).

## Normalization
The schema is normalized to 3NF. No repeating groups (Marks are flattened based on subject types, but mathematically constrained via business logic). 
Primary keys are auto-incrementing integers.