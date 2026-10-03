# 11. Design Patterns

1. **Adapter Pattern**: Implemented in the Excel Import feature. `openpyxl` acts as an adapter that converts unstructured binary Excel data into structured dictionaries that the API can validate and save as `Student` model instances.
2. **Strategy Pattern (Conceptual)**: The marks calculation logic inside the `subject_analytics` and marks saving views switches behavior (Theory vs Lab vs Viva) dynamically based on the subject type.
3. **Repository Pattern**: Handled implicitly by Django ORM Managers (`objects.filter()`, `objects.get_or_create()`).