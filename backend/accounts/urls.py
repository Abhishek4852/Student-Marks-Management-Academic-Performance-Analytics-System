from django.urls import path
from . import views

urlpatterns = [
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/me/', views.me_view, name='me'),
    path('auth/faculty/register/', views.register_faculty, name='register'),
    
    path('faculty/', views.faculty_list, name='faculty_list'),
    path('faculty/<int:pk>/approve/', views.approve_faculty, name='approve_faculty'),
]
