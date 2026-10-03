from rest_framework import serializers
from .models import DegreeProgram, Batch, Student, Semester, Subject, Enrollment, Marks, AuditLog

class DegreeProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = DegreeProgram
        fields = '__all__'

class BatchSerializer(serializers.ModelSerializer):
    degree_program_code = serializers.CharField(source='degree_program.code', read_only=True)
    class Meta:
        model = Batch
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    batch_name = serializers.CharField(source='batch.name', read_only=True)
    class Meta:
        model = Student
        fields = '__all__'

class SemesterSerializer(serializers.ModelSerializer):
    batch_name = serializers.CharField(source='batch.name', read_only=True)
    class Meta:
        model = Semester
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    semester_name = serializers.CharField(source='semester.name', read_only=True)
    assigned_faculty_name = serializers.CharField(source='assigned_faculty.username', read_only=True)
    
    class Meta:
        model = Subject
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    student_details = StudentSerializer(source='student', read_only=True)
    subject_details = SubjectSerializer(source='subject', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = '__all__'

class MarksSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.student_name', read_only=True)
    roll_number = serializers.CharField(source='student.roll_number', read_only=True)
    enrollment_number = serializers.CharField(source='student.enrollment_number', read_only=True)
    
    class Meta:
        model = Marks
        fields = '__all__'
