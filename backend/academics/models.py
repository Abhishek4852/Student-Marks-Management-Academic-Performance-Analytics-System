from django.db import models
from django.conf import settings

class DegreeProgram(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.code})"

class Batch(models.Model):
    degree_program = models.ForeignKey(DegreeProgram, on_delete=models.CASCADE, related_name='batches')
    name = models.CharField(max_length=255)
    start_year = models.IntegerField(null=True, blank=True)
    end_year = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.degree_program.code} - {self.name}"

class Student(models.Model):
    student_name = models.CharField(max_length=255)
    roll_number = models.CharField(max_length=100, unique=True)
    enrollment_number = models.CharField(max_length=100, unique=True)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='students')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.student_name

class Semester(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='semesters')
    semester_number = models.IntegerField()
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.batch.name} - {self.name}"

class Subject(models.Model):
    SUBJECT_TYPES = (
        ('THEORY', 'Theory'),
        ('LAB', 'Lab'),
        ('COMPREHENSIVE_VIVA', 'Comprehensive Viva'),
    )
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=255)
    subject_code = models.CharField(max_length=100)
    subject_type = models.CharField(max_length=50, choices=SUBJECT_TYPES)
    maximum_marks = models.IntegerField(default=100)
    assigned_faculty = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_subjects')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='enrollments')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('student', 'subject')

class Marks(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='marks')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='marks')
    
    internal_1 = models.FloatField(null=True, blank=True)
    internal_2 = models.FloatField(null=True, blank=True)
    internal_3 = models.FloatField(null=True, blank=True)
    end_semester = models.FloatField(null=True, blank=True)
    
    lab_test_1 = models.FloatField(null=True, blank=True)
    lab_test_2 = models.FloatField(null=True, blank=True)
    final_lab_viva = models.FloatField(null=True, blank=True)
    
    comprehensive_viva = models.FloatField(null=True, blank=True)
    
    is_finalized = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('student', 'subject')

class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    entity_type = models.CharField(max_length=100)
    entity_id = models.IntegerField()
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
