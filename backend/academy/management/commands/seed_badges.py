"""
Seeds real, awardable Badge definitions. Award logic lives in
academy/views.py (_maybe_award_badges), triggered at the natural moments
those achievements actually happen — this command only defines what the
badges are, not who has earned them.

Usage: python manage.py seed_badges
"""
from django.core.management.base import BaseCommand

from academy.models import Badge

BADGES = [
    dict(
        slug='first-steps',
        name='First Steps',
        description='Completed your first lesson in the Academy.',
        icon='Footprints',
    ),
    dict(
        slug='course-complete',
        name='Course Complete',
        description='Completed your first full course.',
        icon='GraduationCap',
    ),
    dict(
        slug='quiz-ace',
        name='Quiz Ace',
        description='Scored 100% on a quiz.',
        icon='Target',
    ),
    dict(
        slug='consistent',
        name='Consistent',
        description='Reached a 7-day learning streak.',
        icon='Flame',
    ),
    dict(
        slug='dedicated',
        name='Dedicated',
        description='Reached a 30-day learning streak.',
        icon='Trophy',
    ),
    dict(
        slug='well-rounded',
        name='Well-Rounded',
        description='Completed 5 different courses.',
        icon='Layers',
    ),
]


class Command(BaseCommand):
    help = 'Seed the Academy badge definitions (idempotent)'

    def handle(self, *args, **options):
        created = 0
        for data in BADGES:
            _, was_created = Badge.objects.get_or_create(slug=data['slug'], defaults=data)
            if was_created:
                created += 1

        if created:
            self.stdout.write(self.style.SUCCESS(f'Seeded {created} new badge(s).'))
        else:
            self.stdout.write(self.style.WARNING('All badges already exist. Nothing to do.'))
