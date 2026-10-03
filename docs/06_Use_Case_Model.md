# 6. Use Case Model

## Actors
- **Admin**: Manages core entities and users.
- **Faculty**: Manages marks for assigned subjects.

## Use Cases

### Admin
1. Manage Degree Programs & Batches
2. Upload & Validate Student Excel
3. Manage Semesters & Subjects
4. Assign Faculty to Subjects
5. Approve Pending Faculty
6. View Global Analytics

### Faculty
1. Register Account
2. View Assigned Subjects
3. Enter/Update Marks
4. View Subject Analytics

```mermaid
usecaseDiagram
    actor Admin
    actor Faculty
    
    Admin --> (Upload Excel)
    Admin --> (Approve Faculty)
    Admin --> (Assign Subjects)
    Admin --> (View Global Analytics)
    
    Faculty --> (Register Account)
    Faculty --> (Enter Marks)
    Faculty --> (View Subject Analytics)
```