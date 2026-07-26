"""
Seeds real, standard physical test protocols used widely in athletic
assessment — no invented tests. Coaches record TestResult entries against
these via the Performance Testing page.

Usage: python manage.py seed_test_protocols
"""
from django.core.management.base import BaseCommand

from training.models import TestProtocol

PROTOCOLS = [
    dict(
        name='40-Yard Dash', category='speed', unit='seconds', higher_is_better=False,
        description='Straight-line sprint over 40 yards (36.6m), timed from a stationary start. A standard acceleration/speed benchmark.',
    ),
    dict(
        name='10m Sprint', category='speed', unit='seconds', higher_is_better=False,
        description='Short sprint over 10 metres, timed from a stationary start. Emphasizes first-step quickness and acceleration.',
    ),
    dict(
        name='Vertical Jump (Countermovement)', category='power', unit='cm', higher_is_better=True,
        description='Maximal vertical jump height from a countermovement (dip then jump), measured by reach difference or a jump mat. A standard lower-body power test.',
    ),
    dict(
        name='Standing Broad Jump', category='power', unit='cm', higher_is_better=True,
        description='Maximal horizontal jump distance from a two-footed standing start. A standard horizontal power test.',
    ),
    dict(
        name='1RM Back Squat', category='strength', unit='kg', higher_is_better=True,
        description='Estimated or tested one-repetition maximum in the back squat. A standard lower-body maximal strength benchmark.',
    ),
    dict(
        name='1RM Bench Press', category='strength', unit='kg', higher_is_better=True,
        description='Estimated or tested one-repetition maximum in the bench press. A standard upper-body maximal strength benchmark.',
    ),
    dict(
        name='Beep Test (20m Shuttle Run)', category='endurance', unit='level reached', higher_is_better=True,
        description='Progressive 20m shuttle run to exhaustion, paced by audio beeps that get faster each level. A widely used aerobic capacity field test; result recorded as the level (and shuttle) reached.',
    ),
    dict(
        name='1.5 Mile Run', category='endurance', unit='minutes', higher_is_better=False,
        description='Timed 1.5 mile (2.4km) run at maximal sustainable pace. A standard aerobic endurance field test.',
    ),
    dict(
        name='T-Test Agility', category='agility', unit='seconds', higher_is_better=False,
        description='Timed multi-directional agility course (forward, lateral, and backward movement in a T-shaped pattern). Tests change-of-direction speed.',
    ),
    dict(
        name='Illinois Agility Test', category='agility', unit='seconds', higher_is_better=False,
        description='Timed agility course combining sprinting and weaving through cones. A widely used general agility benchmark.',
    ),
    dict(
        name='Sit-and-Reach', category='flexibility', unit='cm', higher_is_better=True,
        description='Seated forward-reach test measuring hamstring and lower-back flexibility, a long-standing standard flexibility field test.',
    ),
    dict(
        name='Body Fat Percentage', category='body_composition', unit='%', higher_is_better=False,
        description='Estimated body fat percentage via skinfold calipers or bioelectrical impedance. Context and sport-dependent — track individual trend over time rather than comparing athletes to one fixed target.',
    ),
]


class Command(BaseCommand):
    help = 'Seed standard physical test protocols (idempotent)'

    def handle(self, *args, **options):
        created = 0
        for data in PROTOCOLS:
            _, was_created = TestProtocol.objects.get_or_create(name=data['name'], defaults=data)
            if was_created:
                created += 1

        if created:
            self.stdout.write(self.style.SUCCESS(f'Seeded {created} new test protocol(s).'))
        else:
            self.stdout.write(self.style.WARNING('All test protocols already exist. Nothing to do.'))
