# 20. Semester-wise Ranking Algorithm

## Overview
This document specifies the academic ranking algorithm utilized by the system to evaluate student performance across all subjects within a single semester.

## The Algorithm Logic
The system computes rankings based on the highest overall marks across all enrolled subjects in the semester. To ensure fairness and accuracy in the event of identical total scores, a cascading tie-breaker priority is applied.

### Calculation Steps
1. **Compute Overall Marks**: Calculate the sum of `(best 2 internal marks + end semester marks)` for Theory subjects, or `(test 1 + test 2 + final viva)` for Lab subjects across the entire semester.
2. **Compute End Sem Total**: Calculate the sum of only the final exams (`end_semester` or `final_lab_viva`) across all subjects.
3. **Compute Internal 2 Total**: Calculate the sum of all `internal_2` (or `lab_test_2`) marks across all subjects.
4. **Compute Internal 1 Total**: Calculate the sum of all `internal_1` (or `lab_test_1`) marks across all subjects.

### Tie-Breaker Priority Rules
When two or more students have the exact same Overall Marks, their rankings are resolved using the following checks in order:
1. **Primary Tie-breaker**: The student with the higher End Semester Average/Total takes precedence.
2. **Secondary Tie-breaker**: If the End Semester marks are also identical, the student with the higher Internal 2 Average/Total takes precedence.
3. **Tertiary Tie-breaker**: If the Internal 2 marks are also identical, the student with the higher Internal 1 Average/Total takes precedence.
4. **Final Tie**: If all evaluated parameters are absolutely identical, the students share the same rank (e.g., Rank 1, Rank 1, Rank 3).

## Implementation
The logic is implemented natively within the backend (`backend/academics/views.py -> semester_ranking`). It fetches all marks associated with the active semester, computes the aggregates via Python tuples, and sorts the list using `lambda x: (x['overall'], x['end_sem'], x['int2'], x['int1'])` in descending order. Rank indexes are assigned iteratively after sorting.
