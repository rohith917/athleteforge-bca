"""
Ensure demo accounts and sample data exist (safe for every deploy).
Usage: python manage.py ensure_demo
"""
from datetime import date, timedelta

from django.contrib.auth.models import User
from django.core.management import call_command
from django.core.management.base import BaseCommand

from api.models import Athlete, Goal, Announcement


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
        self._ensure_goals_and_announcements()
        self.stdout.write(self.style.SUCCESS('Demo accounts ready.'))

    def _ensure_goals_and_announcements(self):
        coach = User.objects.filter(username='coach').first()

        if not Goal.objects.exists():
            athletes = list(Athlete.objects.order_by('id')[:3])
            metrics = ['speed_score', 'endurance_score', 'strength_score']
            for athlete, metric in zip(athletes, metrics):
                Goal.objects.create(
                    athlete=athlete,
                    metric=metric,
                    title=f'Boost {metric.replace("_score", "")} before next meet',
                    target_value=85,
                    target_date=date.today() + timedelta(days=45),
                    created_by=coach,
                )
            if athletes:
                self.stdout.write(self.style.SUCCESS(f'Seeded {len(athletes)} demo goals.'))

        if not Announcement.objects.exists():
            Announcement.objects.create(
                title='Welcome to AthleteForge',
                message='This is a live demo — explore performance tracking, injuries, goals, and the leaderboard.',
                audience='all',
                pinned=True,
                created_by=coach,
            )
            Announcement.objects.create(
                title='Regional trials in 3 weeks',
                message='All athletes should log attendance and complete wellness check-ins daily leading up to trials.',
                audience='students',
                created_by=coach,
            )
            self.stdout.write(self.style.SUCCESS('Seeded demo announcements.'))