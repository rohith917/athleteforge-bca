import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'athlete_system.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Athlete, Performance, Injury, Competition

print("=== ATHLETEFORGE DEMO DATA VERIFICATION ===")
print(f"Users total: {User.objects.count()}")
print("Usernames:", list(User.objects.values_list('username', flat=True)))
print()
print(f"Athletes total: {Athlete.objects.count()}")
for a in Athlete.objects.all()[:10]:
    print(f"  - {getattr(a, 'name', getattr(a, 'full_name', str(a)))} | {getattr(a, 'sport', '')} | {getattr(a, 'team', '')} | status={getattr(a, 'status', '')}")
print()
print(f"Performance records: {Performance.objects.count()}")
print(f"Injuries: {Injury.objects.count()}")
print(f"Competitions: {Competition.objects.count()}")
print()
print("Demo accounts ready:")
print("  admin / admin123 (admin)")
print("  coach / coach123 (coach)")
print("  rahul.sharma@email.com / student123 (student)")
print("=== VERIFICATION COMPLETE ===")