import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from academics.models import DegreeProgram

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123', role='ADMIN', is_approved=True)
    print("Admin user created (admin / admin123)")

programs = [
    ('BCE + MCA', 'BCE_MCA'),
    ('B.Tech + M.Tech', 'BTECH_MTECH'),
    ('B.Com + M.Com', 'BCOM_MCOM'),
    ('BBA + MBA', 'BBA_MBA'),
]
for name, code in programs:
    DegreeProgram.objects.get_or_create(name=name, code=code)
    print(f"Program {name} seeded.")
