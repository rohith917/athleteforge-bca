"""
Management command to create default admin and coach users.
Usage: python manage.py setup_admin
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import UserProfile, Athlete


class Command(BaseCommand):
    help = 'Create default admin and coach users with profiles'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@athleteforge.com',
                password='admin123',
                first_name='System',
                last_name='Administrator',
            )
            UserProfile.objects.create(user=admin, role='admin')
            self.stdout.write(self.style.SUCCESS('Admin: admin / admin123 (role: admin)'))
        else:
            admin = User.objects.get(username='admin')
            UserProfile.objects.get_or_create(user=admin, defaults={'role': 'admin'})
            self.stdout.write(self.style.WARNING('Admin user already exists'))

        if not User.objects.filter(username='coach').exists():
            coach = User.objects.create_user(
                username='coach',
                email='coach@athleteforge.com',
                password='coach123',
                first_name='Rajesh',
                last_name='Coach',
            )
            UserProfile.objects.create(user=coach, role='coach')
            self.stdout.write(self.style.SUCCESS('Coach: coach / coach123 (role: coach)'))
        else:
            coach = User.objects.get(username='coach')
            UserProfile.objects.get_or_create(user=coach, defaults={'role': 'coach'})
            self.stdout.write(self.style.WARNING('Coach user already exists'))

        # Demo student linked to first athlete with matching email
        athlete = Athlete.objects.filter(email='rahul.sharma@email.com').first()
        if athlete and not User.objects.filter(email='rahul.sharma@email.com').exists():
            student = User.objects.create_user(
                username='rahul',
                email='rahul.sharma@email.com',
                password='student123',
                first_name='Rahul',
                last_name='Sharma',
            )
            UserProfile.objects.create(user=student, role='student', athlete=athlete)
            self.stdout.write(self.style.SUCCESS('Student: rahul.sharma@email.com / student123'))
        elif User.objects.filter(email='rahul.sharma@email.com').exists():
            student = User.objects.get(email='rahul.sharma@email.com')
            profile, _ = UserProfile.objects.get_or_create(user=student, defaults={'role': 'student'})
            if athlete and not profile.athlete_id:
                profile.athlete = athlete
                profile.save()
            self.stdout.write(self.style.WARNING('Student demo account already exists'))