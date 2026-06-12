"""
Ensure demo accounts and sample data exist (safe for every deploy).
Usage: python manage.py ensure_demo
"""
from django.core.management import call_command
from django.core.management.base import BaseCommand
from api.models import Athlete


class Command(BaseCommand):
    help = 'Ensure demo logins and sample athlete data for viva presentation'

    def handle(self, *args, **options):
        athlete_count = Athlete.objects.count()
        if athlete_count < 6:
            self.stdout.write(self.style.WARNING(
                f'Only {athlete_count} athletes found — loading sample data...'
            ))
            call_command('seed_data')
        else:
            self.stdout.write(self.style.SUCCESS(f'Demo data OK ({athlete_count} athletes)'))

        call_command('setup_admin')
        self.stdout.write(self.style.SUCCESS('Demo accounts ready.'))