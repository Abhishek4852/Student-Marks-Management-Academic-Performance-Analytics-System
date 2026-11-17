import re
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

        # Check duplicate batch: same course and same duration (start_year and end_year)
        if degree_program and start_year and end_year:
            existing = Batch.objects.filter(
                degree_program=degree_program,
                start_year=start_year,
                end_year=end_year
            )
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError({
                    "batch": f"A batch for '{degree_program.name}' with duration {start_year}-{end_year} already exists."
                })

        # Ensure consistent batch naming format: <Course Name> <start_year>-<end_year>
        if degree_program and start_year and end_year:
            attrs['name'] = f"{degree_program.name} {start_year}-{end_year}"

        return attrs

class StudentSerializer(serializers.ModelSerializer):
    batch_name = serializers.CharField(source='batch.name', read_only=True)

    class Meta:
        model = Student
        fields = '__all__'

    def validate_student_name(self, value):
        name = value.strip()
        if len(name) < 2:
            raise serializers.ValidationError("Student name must be at least 2 characters long.")
        if not re.match(r"^[A-Za-z\s.']+$", name):
            raise serializers.ValidationError("Student name must contain only letters and spaces (no numbers or symbols).")
        return name

    def validate_roll_number(self, value):
        roll = value.strip().upper()
        if not re.match(r"^[A-Za-z]{2,4}-(?:2K\d{2}|20\d{2})-\d{1,4}$", roll):
            raise serializers.ValidationError("Invalid roll number format. Roll number must be in format like IC-2K22-107.")
        return roll

    def validate_enrollment_number(self, value):
        enroll = value.strip().upper()
        if not re.match(r"^(?:[A-Za-z]{2,3}\d{5,8}|EN-[A-Za-z0-9-]+)$", enroll):
            raise serializers.ValidationError("Invalid enrollment number format. Enrollment number must be in format like DX2201125.")
        return enroll

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
