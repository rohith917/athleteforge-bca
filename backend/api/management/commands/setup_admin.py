"""
Management command to create default admin user.
Usage: python manage.py setup_admin
Default credentials: admin / admin123
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create default admin user for the system'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@athletetracking.com',
                password='admin123',
                first_name='System',
                last_name='Administrator'
            )
            self.stdout.write(self.style.SUCCESS('Admin user created: admin / admin123'))
        else:
            self.stdout.write(self.style.WARNING('Admin user already exists'))