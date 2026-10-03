from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import DegreeProgram, Batch, Student, Semester, Subject, Enrollment, Marks
from .serializers import (DegreeProgramSerializer, BatchSerializer, StudentSerializer, 
                          SemesterSerializer, SubjectSerializer, EnrollmentSerializer, MarksSerializer)
from django.contrib.auth import get_user_model
from django.db import transaction
import openpyxl

User = get_user_model()

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def program_list(request):
    if request.method == 'GET':
        programs = DegreeProgram.objects.all()
        serializer = DegreeProgramSerializer(programs, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        if request.user.role != 'ADMIN':
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = DegreeProgramSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def batch_list(request):
    if request.method == 'GET':
        batches = Batch.objects.all()
        serializer = BatchSerializer(batches, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        if request.user.role != 'ADMIN':
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = BatchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def student_list(request):
    if request.method == 'GET':
        batch_id = request.query_params.get('batch_id')
        if batch_id:
            students = Student.objects.filter(batch_id=batch_id)
        else:
            students = Student.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        if request.user.role != 'ADMIN':
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def student_detail(request, pk):
    if request.user.role != 'ADMIN':
        return Response(status=status.HTTP_403_FORBIDDEN)
    try:
        student = Student.objects.get(pk=pk)
    except Student.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    if request.method == 'PATCH':
        serializer = StudentSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        student.delete()
        return Response({'message': 'Student deleted successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def student_import_preview(request):
    if request.user.role != 'ADMIN':
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    file_obj = request.FILES.get('file')
    if not file_obj:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        wb = openpyxl.load_workbook(file_obj)
        sheet = wb.active
        rows = list(sheet.iter_rows(values_only=True))
        
        preview_data = []
        for i, row in enumerate(rows[1:], start=2):
            if not row or all(v is None for v in row):
                continue
            
            preview_data.append({
                'row_index': i,
                'student_name': row[0] if len(row) > 0 else None,
                'roll_number': str(row[1]) if len(row) > 1 and row[1] else None,
                'enrollment_number': str(row[2]) if len(row) > 2 and row[2] else None,
            })
            
        return Response({'preview': preview_data})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def student_import_confirm(request):
    if request.user.role != 'ADMIN':
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    batch_id = request.data.get('batch_id')
    students_data = request.data.get('students', [])
    
    if not batch_id:
        return Response({'error': 'batch_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        batch = Batch.objects.get(pk=batch_id)
    except Batch.DoesNotExist:
        return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)
        
    created_count = 0
    errors = []
    
    with transaction.atomic():
        for item in students_data:
            roll = item.get('roll_number')
            enroll = item.get('enrollment_number')
            
            if Student.objects.filter(roll_number=roll).exists():
                errors.append(f"Roll number {roll} already exists.")
                continue
            if Student.objects.filter(enrollment_number=enroll).exists():
                errors.append(f"Enrollment number {enroll} already exists.")
                continue
                
            Student.objects.create(
                student_name=item.get('student_name'),
                roll_number=roll,
                enrollment_number=enroll,
                batch=batch
            )
            created_count += 1
            
    if errors and created_count == 0:
        return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
        
    return Response({'message': f'Created {created_count} students.', 'errors': errors})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def semester_list(request):
    if request.method == 'GET':
        batch_id = request.query_params.get('batch_id')
        if batch_id:
            semesters = Semester.objects.filter(batch_id=batch_id)
        else:
            semesters = Semester.objects.all()
        serializer = SemesterSerializer(semesters, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        if request.user.role != 'ADMIN':
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = SemesterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def subject_list(request):
    if request.method == 'GET':
        semester_id = request.query_params.get('semester_id')
        if semester_id:
            subjects = Subject.objects.filter(semester_id=semester_id)
        else:
            subjects = Subject.objects.all()
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        if request.user.role != 'ADMIN':
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def subject_detail(request, pk):
    if request.user.role != 'ADMIN':
        return Response(status=status.HTTP_403_FORBIDDEN)
    try:
        subject = Subject.objects.get(pk=pk)
    except Subject.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    serializer = SubjectSerializer(subject, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def enrollment_list(request):
    semester_id = request.query_params.get('semester_id')
    if semester_id:
        enrollments = Enrollment.objects.filter(subject__semester_id=semester_id)
    else:
        enrollments = Enrollment.objects.all()
    serializer = EnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_all_in_semester(request, pk):
    if request.user.role != 'ADMIN':
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    try:
        semester = Semester.objects.get(pk=pk)
    except Semester.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    students = Student.objects.filter(batch=semester.batch, is_active=True)
    subjects = Subject.objects.filter(semester=semester, is_active=True)
    
    count = 0
    with transaction.atomic():
        for student in students:
            for subject in subjects:
                _, created = Enrollment.objects.get_or_create(student=student, subject=subject)
                if created:
                    count += 1
                    Marks.objects.get_or_create(student=student, subject=subject)
                    
    return Response({'message': f'Created {count} new enrollments.'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_subjects(request):
    if request.user.role != 'FACULTY':
        return Response(status=status.HTTP_403_FORBIDDEN)
        
    subjects = Subject.objects.filter(assigned_faculty=request.user)
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subject_students(request, pk):
    try:
        subject = Subject.objects.get(pk=pk)
    except Subject.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    if request.user.role == 'FACULTY' and subject.assigned_faculty != request.user:
        return Response(status=status.HTTP_403_FORBIDDEN)
        
    enrollments = Enrollment.objects.filter(subject=subject)
    students = [e.student for e in enrollments]
    serializer = StudentSerializer(students, many=True)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def subject_marks(request, pk):
    try:
        subject = Subject.objects.get(pk=pk)
    except Subject.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    if request.user.role == 'FACULTY' and subject.assigned_faculty != request.user:
        return Response(status=status.HTTP_403_FORBIDDEN)
        
    if request.method == 'GET':
        marks = Marks.objects.filter(subject=subject)
        serializer = MarksSerializer(marks, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        marks_data = request.data.get('marks', [])
        updated = 0
        with transaction.atomic():
            for item in marks_data:
                try:
                    mark_obj = Marks.objects.get(id=item.get('id'), subject=subject)
                    if mark_obj.is_finalized:
                        continue
                        
                    if subject.subject_type == 'THEORY':
                        mark_obj.internal_1 = item.get('internal_1')
                        mark_obj.internal_2 = item.get('internal_2')
                        mark_obj.internal_3 = item.get('internal_3')
                        mark_obj.end_semester = item.get('end_semester')
                    elif subject.subject_type == 'LAB':
                        mark_obj.lab_test_1 = item.get('lab_test_1')
                        mark_obj.lab_test_2 = item.get('lab_test_2')
                        mark_obj.final_lab_viva = item.get('final_lab_viva')
                    elif subject.subject_type == 'COMPREHENSIVE_VIVA':
                        mark_obj.comprehensive_viva = item.get('comprehensive_viva')
                        
                    mark_obj.save()
                    updated += 1
                except Marks.DoesNotExist:
                    pass
        return Response({'message': f'Updated {updated} records.'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subject_analytics(request, pk):
    try:
        subject = Subject.objects.get(pk=pk)
    except Subject.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    if request.user.role == 'FACULTY' and subject.assigned_faculty != request.user:
        return Response(status=status.HTTP_403_FORBIDDEN)
        
    marks = Marks.objects.filter(subject=subject).select_related('student')
    
    student_data = []
    
    total_int1 = 0
    total_int2 = 0
    total_int3 = 0
    total_endsem = 0
    total_overall = 0
    valid_count = 0
    
    for m in marks:
        data = {
            'student_name': m.student.student_name,
            'roll_number': m.student.roll_number
        }
        
        if subject.subject_type == 'THEORY':
            i1 = m.internal_1 or 0
            i2 = m.internal_2 or 0
            i3 = m.internal_3 or 0
            es = m.end_semester or 0
            
            # Normalize to 100%
            data['internal_1'] = i1 * 5
            data['internal_2'] = i2 * 5
            data['internal_3'] = i3 * 5
            data['end_semester'] = round((es / 60) * 100, 2) if es > 0 else 0
            
            best_two = sum(sorted([i1, i2, i3], reverse=True)[:2])
            data['overall'] = best_two + es # out of 100
            
            total_int1 += data['internal_1']
            total_int2 += data['internal_2']
            total_int3 += data['internal_3']
            total_endsem += data['end_semester']
            total_overall += data['overall']
            valid_count += 1
            
        elif subject.subject_type == 'LAB':
            l1 = m.lab_test_1 or 0
            l2 = m.lab_test_2 or 0
            fv = m.final_lab_viva or 0
            
            data['internal_1'] = l1 * 5
            data['internal_2'] = l2 * 5
            data['end_semester'] = round((fv / 60) * 100, 2) if fv > 0 else 0
            data['overall'] = l1 + l2 + fv
            
            total_int1 += data['internal_1']
            total_int2 += data['internal_2']
            total_endsem += data['end_semester']
            total_overall += data['overall']
            valid_count += 1
            
        student_data.append(data)
        
    averages = {}
    if valid_count > 0:
        averages = {
            'internal_1': round(total_int1 / valid_count, 2),
            'internal_2': round(total_int2 / valid_count, 2),
            'internal_3': round(total_int3 / valid_count, 2) if subject.subject_type == 'THEORY' else None,
            'end_semester': round(total_endsem / valid_count, 2),
            'overall': round(total_overall / valid_count, 2)
        }
        
    return Response({
        'students': student_data,
        'averages': averages,
        'subject_type': subject.subject_type
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    if request.user.role == 'ADMIN':
        return Response({
            'students_count': Student.objects.count(),
            'faculty_count': User.objects.filter(role='FACULTY').count(),
            'subjects_count': Subject.objects.count(),
            'batches_count': Batch.objects.count(),
        })
    else:
        subjects = Subject.objects.filter(assigned_faculty=request.user)
        return Response({
            'assigned_subjects_count': subjects.count(),
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def semester_ranking(request, pk):
    try:
        semester = Semester.objects.get(pk=pk)
    except Semester.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    students = Student.objects.filter(batch=semester.batch)
    subjects = Subject.objects.filter(semester=semester)
    
    student_stats = []
    
    for student in students:
        marks = Marks.objects.filter(student=student, subject__in=subjects)
        
        overall = 0
        end_sem_total = 0
        int2_total = 0
        int1_total = 0
        
        has_marks = False
        
        for m in marks:
            has_marks = True
            
            if m.subject.subject_type == 'THEORY':
                es = m.end_semester or 0
                i1 = m.internal_1 or 0
                i2 = m.internal_2 or 0
                i3 = m.internal_3 or 0
                
                best_two = sum(sorted([i1, i2, i3], reverse=True)[:2])
                
                overall += (best_two + es)
                end_sem_total += es
                int2_total += i2
                int1_total += i1
                
            elif m.subject.subject_type == 'LAB':
                es = m.final_lab_viva or 0
                i1 = m.lab_test_1 or 0
                i2 = m.lab_test_2 or 0
                
                overall += (i1 + i2 + es)
                end_sem_total += es
                int2_total += i2
                int1_total += i1
                
            elif m.subject.subject_type == 'COMPREHENSIVE_VIVA':
                viva = m.comprehensive_viva or 0
                overall += viva
                end_sem_total += viva
                
        if has_marks:
            student_stats.append({
                'id': student.id,
                'name': student.student_name,
                'roll_number': student.roll_number,
                'overall': overall,
                'end_sem': end_sem_total,
                'int2': int2_total,
                'int1': int1_total
            })
            
    # Sort by the tuple (overall, end_sem, int2, int1) descending
    student_stats.sort(key=lambda x: (x['overall'], x['end_sem'], x['int2'], x['int1']), reverse=True)
    
    # Assign ranks
    rank = 1
    for i in range(len(student_stats)):
        if i > 0:
            prev = student_stats[i-1]
            curr = student_stats[i]
            if (curr['overall'] == prev['overall'] and
                curr['end_sem'] == prev['end_sem'] and
                curr['int2'] == prev['int2'] and
                curr['int1'] == prev['int1']):
                curr['rank'] = prev['rank']
            else:
                curr['rank'] = rank
        else:
            student_stats[i]['rank'] = rank
        rank += 1
        
    return Response(student_stats)
