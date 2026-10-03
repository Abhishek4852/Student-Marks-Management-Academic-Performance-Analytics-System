from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('FACULTY', 'Faculty'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='FACULTY')
    is_approved = models.BooleanField(default=False)
