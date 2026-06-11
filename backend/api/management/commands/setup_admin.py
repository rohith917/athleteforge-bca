"""
Management command to create default admin and coach users.
Resets demo passwords on every run so login always works after deploy.
Usage: python manage.py setup_admin
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import UserProfile, Athlete


class Command(BaseCommand):
    help = 'Create default admin and coach users with profiles'

    def _ensure_user(self, username, email, password, role, *, superuser=False, first_name='', last_name=''):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
            },
        )
        user.email = email
        user.first_name = first_name or user.first_name
        user.last_name = last_name or user.last_name
        user.is_active = True
        user.set_password(password)
        if superuser:
            user.is_superuser = True
            user.is_staff = True
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'role': role})
        profile.role = role
        profile.save()

        verb = 'Created' if created else 'Reset'
        self.stdout.write(self.style.SUCCESS(f'{verb}: {username} / {password} (role: {role})'))

    def handle(self, *args, **options):
        self._ensure_user(
            'admin',
            'admin@athleteforge.com',
            'admin123',
            'admin',
            superuser=True,
            first_name='System',
            last_name='Administrator',
        )

        self._ensure_user(
            'coach',
            'coach@athleteforge.com',
            'coach123',
            'coach',
            first_name='Rajesh',
            last_name='Coach',
        )

        athlete = Athlete.objects.filter(email='rahul.sharma@email.com').first()
        student_email = 'rahul.sharma@email.com'
        if athlete and not User.objects.filter(username='rahul').exists():
            student = User.objects.create_user(
                username='rahul',
                email=student_email,
                password='student123',
                first_name='Rahul',
                last_name='Sharma',
            )
            UserProfile.objects.create(user=student, role='student', athlete=athlete)
            self.stdout.write(self.style.SUCCESS('Created: rahul.sharma@email.com / student123 (role: student)'))
        elif User.objects.filter(username='rahul').exists() or User.objects.filter(email=student_email).exists():
            student = User.objects.filter(username='rahul').first() or User.objects.get(email=student_email)
            student.set_password('student123')
            student.is_active = True
            student.save()
            profile, _ = UserProfile.objects.get_or_create(user=student, defaults={'role': 'student'})
            profile.role = 'student'
            if athlete and not profile.athlete_id:
                profile.athlete = athlete
            profile.save()
            self.stdout.write(self.style.SUCCESS('Reset: rahul.sharma@email.com / student123 (role: student)'))
        else:
            self.stdout.write(self.style.WARNING('Student demo skipped — seed athletes first (run seed_data)'))