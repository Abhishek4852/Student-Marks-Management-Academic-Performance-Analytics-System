from rest_framework import serializers
from .models import DegreeProgram, Batch, Student, Semester, Subject, Enrollment, Marks, AuditLog

class DegreeProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = DegreeProgram
        fields = '__all__'

class BatchSerializer(serializers.ModelSerializer):
    degree_program_code = serializers.CharField(source='degree_program.code', read_only=True)
    degree_program_name = serializers.CharField(source='degree_program.name', read_only=True)

    class Meta:
        model = Batch
        fields = '__all__'

    def validate(self, attrs):
        start_year = attrs.get('start_year')
        end_year = attrs.get('end_year')
        degree_program = attrs.get('degree_program')

        if start_year is not None and start_year < 2022:
            raise serializers.ValidationError({"start_year": "Admin cannot create batch before 2022."})

        if start_year is not None and end_year is not None:
            duration = end_year - start_year
            if duration < 2 or duration > 6:
                raise serializers.ValidationError({"end_year": "Course duration must be between 2 years to 6 years only."})

        # Ensure consistent batch naming format: <Course Name> <start_year>-<end_year>
        if degree_program and start_year and end_year:
            attrs['name'] = f"{degree_program.name} {start_year}-{end_year}"

        return attrs

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
    semester_name = serializers.CharField(source='semester.name', default='', read_only=True)
    semester_number = serializers.IntegerField(source='semester.semester_number', default=None, read_only=True)
    batch_id = serializers.IntegerField(source='semester.batch.id', default=None, read_only=True)
    batch_name = serializers.CharField(source='semester.batch.name', default='', read_only=True)
    degree_program_name = serializers.CharField(source='semester.batch.degree_program.name', default='', read_only=True)
    degree_program_code = serializers.CharField(source='semester.batch.degree_program.code', default='', read_only=True)
    assigned_faculty_name = serializers.CharField(source='assigned_faculty.username', default='', read_only=True)
    
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
