# 12. Software Design Document (SDD)

## Introduction
Translates the SRS into a technical blueprint.

## Subsystem Decomposition
- **Accounts Subsystem**: Manages the custom User model, auth tokens, and faculty approval.
- **Academics Subsystem**: Manages the core hierarchy (Program -> Batch -> Semester -> Subject) and marks mapping.

## API Design
RESTful principles are followed. Endpoints use standard HTTP verbs (GET for fetching, POST for creating/enrolling, PATCH for partial updates like marks or approval, DELETE for student removal).

## Security Considerations
- Authentication via DRF Token.
- Endpoint-level permissions checking `request.user.role == 'ADMIN'` or `FACULTY`.
- Transactions (`transaction.atomic`) are used during batch enrollments and marks saving to prevent partial data corruption.