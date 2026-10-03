from django.urls import path
from . import views

urlpatterns = [
    path('programs/', views.program_list, name='program_list'),
    path('batches/', views.batch_list, name='batch_list'),
    path('students/', views.student_list, name='student_list'),
    path('students/<int:pk>/', views.student_detail, name='student_detail'),
    path('students/import/preview/', views.student_import_preview, name='student_import_preview'),
    path('students/import/confirm/', views.student_import_confirm, name='student_import_confirm'),
    
    path('semesters/', views.semester_list, name='semester_list'),
    path('subjects/', views.subject_list, name='subject_list'),
    path('subjects/<int:pk>/', views.subject_detail, name='subject_detail'),
    
    path('enrollments/', views.enrollment_list, name='enrollment_list'),
    path('semesters/<int:pk>/enroll-all/', views.enroll_all_in_semester, name='enroll_all'),
    
    path('faculty/my-subjects/', views.faculty_subjects, name='faculty_subjects'),
    path('subjects/<int:pk>/students/', views.subject_students, name='subject_students'),
    path('subjects/<int:pk>/marks/', views.subject_marks, name='subject_marks'),
    path('semesters/<int:pk>/analytics/', views.subject_analytics, name='semester_analytics'),
    path('semesters/<int:pk>/ranking/', views.semester_ranking, name='semester_ranking'),
    
    path('dashboard/', views.dashboard_data, name='dashboard_data'),
]
