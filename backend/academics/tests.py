import pytest
from accounts.models import User
from academics.models import DegreeProgram, Batch, Student, Semester, Subject, Enrollment, Marks

@pytest.mark.django_db
def test_student_creation_pytest():
    program = DegreeProgram.objects.create(name="BCA + MCA")
    
    batch = Batch.objects.create(
        name="2022-2027", 
        degree_program=program,
        start_year=2022,
        end_year=2027
    )
    
    Student.objects.create(
        student_name="Rahul", 
        roll_number="IC-2K22-01",
        enrollment_number="EN-01",
        batch=batch
    )

    assert Student.objects.count() == 1
    
    student = Student.objects.get(roll_number="IC-2K22-01")
    assert student.student_name == "Rahul"
    assert student.batch.name == "2022-2027"

@pytest.mark.django_db
def test_semester_and_subject_creation():
    program = DegreeProgram.objects.create(name="B.Tech")
    batch = Batch.objects.create(name="2023-2027", degree_program=program, start_year=2023, end_year=2027)
    
    semester = Semester.objects.create(semester_number=1, name="Semester 1", batch=batch)
    
    # Ek dummy faculty user banate hain
    faculty = User.objects.create(username="prof_sharma", role="FACULTY")
    
    # Subject create karke faculty ko assign karte hain
    subject = Subject.objects.create(
        subject_code="CS101",
        name="Introduction to Programming",
        subject_type="THEORY",
        semester=semester,
        assigned_faculty=faculty
    )
    
    assert Semester.objects.count() == 1
    assert Subject.objects.count() == 1
    assert subject.subject_type == "THEORY"
    assert subject.assigned_faculty.username == "prof_sharma"

@pytest.mark.django_db
def test_enrollment_and_marks():
    program = DegreeProgram.objects.create(name="MCA")
    batch = Batch.objects.create(name="2024-2026", degree_program=program, start_year=2024, end_year=2026)
    student = Student.objects.create(student_name="Amit", roll_number="101", enrollment_number="E101", batch=batch)
    semester = Semester.objects.create(semester_number=1, name="Sem 1", batch=batch)
    subject = Subject.objects.create(subject_code="CS201", name="DBMS", subject_type="THEORY", semester=semester)
    
    # Student ko Subject me enroll karna
    Enrollment.objects.create(student=student, subject=subject)
    
    # Marks entry karna
    Marks.objects.create(student=student, subject=subject, internal_1=18, end_semester=50)
    
    assert Enrollment.objects.count() == 1
    
    mark_record = Marks.objects.first()
    # Check kar rahe hain ki existing marks sahi hain
    assert mark_record.internal_1 == 18
    assert mark_record.end_semester == 50
    # Check kar rahe hain ki jo marks enter NAHI hue (jaise internal_2), wo NULL (None) hain
    assert mark_record.internal_2 is None

@pytest.mark.django_db
def test_subject_serializer_includes_batch_and_semester():
    from academics.serializers import SubjectSerializer
    program = DegreeProgram.objects.create(name="BCE + MCA", code="BCE_MCA")
    batch = Batch.objects.create(name="2022-2027", degree_program=program, start_year=2022, end_year=2027)
    semester = Semester.objects.create(semester_number=9, name="Semester 9", batch=batch)
    faculty = User.objects.create(username="test_prof", role="FACULTY")
    subject = Subject.objects.create(
        subject_code="CS-901",
        name="Object Oriented Analysis & Design",
        subject_type="THEORY",
        semester=semester,
        assigned_faculty=faculty
    )
    serializer = SubjectSerializer(subject)
    data = serializer.data
    assert data['batch_name'] == "2022-2027"
    assert data['semester_name'] == "Semester 9"
    assert data['degree_program_name'] == "BCE + MCA"
    assert data['assigned_faculty_name'] == "test_prof"

@pytest.mark.django_db
def test_subject_marks_validation():
    from rest_framework.test import APIClient
    program = DegreeProgram.objects.create(name="BCE + MCA", code="BCE_MCA")
    batch = Batch.objects.create(name="2022-2027", degree_program=program, start_year=2022, end_year=2027)
    semester = Semester.objects.create(semester_number=9, name="Semester 9", batch=batch)
    faculty = User.objects.create(username="prof_valid", role="FACULTY")
    student = Student.objects.create(student_name="Test Student", roll_number="TEST01", enrollment_number="EN_TEST01", batch=batch)
    subject = Subject.objects.create(
        subject_code="CS-901",
        name="OOAD",
        subject_type="THEORY",
        semester=semester,
        assigned_faculty=faculty
    )
    Enrollment.objects.create(student=student, subject=subject)
    mark_obj = Marks.objects.create(student=student, subject=subject)

    client = APIClient()
    client.force_authenticate(user=faculty)

    # 1. Negative internal mark should fail (HTTP 400)
    res_neg = client.post(f"/api/subjects/{subject.id}/marks/", {
        'marks': [{'id': mark_obj.id, 'internal_1': -2, 'end_semester': 45}]
    }, format='json')
    assert res_neg.status_code == 400
    assert "cannot be negative" in res_neg.data['error']

    # 2. Internal mark > 20 should fail (HTTP 400)
    res_high_int = client.post(f"/api/subjects/{subject.id}/marks/", {
        'marks': [{'id': mark_obj.id, 'internal_1': 22, 'end_semester': 45}]
    }, format='json')
    assert res_high_int.status_code == 400
    assert "cannot exceed 20" in res_high_int.data['error']

    # 3. End semester mark > 60 should fail (HTTP 400)
    res_high_endsem = client.post(f"/api/subjects/{subject.id}/marks/", {
        'marks': [{'id': mark_obj.id, 'internal_1': 18, 'end_semester': 65}]
    }, format='json')
    assert res_high_endsem.status_code == 400
    assert "cannot exceed 60" in res_high_endsem.data['error']

    # 4. Valid marks should succeed (HTTP 200)
    res_valid = client.post(f"/api/subjects/{subject.id}/marks/", {
        'marks': [{'id': mark_obj.id, 'internal_1': 19, 'internal_2': 18, 'internal_3': 17, 'end_semester': 55}]
    }, format='json')
    assert res_valid.status_code == 200
    mark_obj.refresh_from_db()
    assert mark_obj.internal_1 == 19
    assert mark_obj.end_semester == 55

