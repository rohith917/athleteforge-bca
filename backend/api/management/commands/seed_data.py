"""
Load sample data for development/demo.
Usage: python manage.py seed_data
"""
from datetime import date
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import (
    Athlete, Performance, Injury, Competition,
    CompetitionResult, Attendance, WeightTracking, UserProfile
)


class Command(BaseCommand):
    help = 'Load sample data for demo and viva presentation'

    def handle(self, *args, **options):
        if Athlete.objects.exists():
            self.stdout.write(self.style.WARNING('Sample data already exists. Skipping.'))
            return

        athletes_data = [
            ('Rahul', 'Sharma', 'rahul.sharma@email.com', '9876543210', '2001-03-15', 'Male', 'Athletics', 'Team Alpha', 178.50, 'Active'),
            ('Priya', 'Patel', 'priya.patel@email.com', '9876543212', '2002-07-22', 'Female', 'Swimming', 'Team Alpha', 165.00, 'Active'),
            ('Arjun', 'Singh', 'arjun.singh@email.com', '9876543214', '2000-11-08', 'Male', 'Football', 'Team Beta', 182.00, 'Injured'),
            ('Sneha', 'Reddy', 'sneha.reddy@email.com', '9876543216', '2001-05-30', 'Female', 'Badminton', 'Team Beta', 168.00, 'Active'),
            ('Vikram', 'Kumar', 'vikram.kumar@email.com', '9876543218', '1999-12-12', 'Male', 'Cricket', 'Team Gamma', 175.00, 'Active'),
            ('Ananya', 'Nair', 'ananya.nair@email.com', '9876543220', '2002-01-25', 'Female', 'Athletics', 'Team Gamma', 170.00, 'Active'),
        ]

        athletes = []
        for data in athletes_data:
            a = Athlete.objects.create(
                first_name=data[0], last_name=data[1], email=data[2], phone=data[3],
                date_of_birth=date.fromisoformat(data[4]), gender=data[5],
                sport=data[6], team=data[7], height_cm=data[8], status=data[9]
            )
            athletes.append(a)

        # Performance records
        perf_data = [
            (0, '2026-01-15', 85.5, 78, 82, 70, 88),
            (0, '2026-02-15', 87, 80, 84, 72, 90),
            (1, '2026-01-20', 75, 65, 92, 80, 70),
            (1, '2026-02-20', 78, 68, 94, 82, 72),
            (2, '2026-01-10', 80, 85, 75, 65, 82),
            (3, '2026-02-01', 70, 60, 68, 85, 75),
            (4, '2026-02-10', 72, 78, 70, 68, 76),
            (5, '2026-02-15', 88, 72, 86, 75, 85),
        ]
        for p in perf_data:
            Performance.objects.create(
                athlete=athletes[p[0]], record_date=date.fromisoformat(p[1]),
                speed_score=p[2], strength_score=p[3], endurance_score=p[4],
                flexibility_score=p[5], agility_score=p[6]
            )

        # Injuries
        Injury.objects.create(athlete=athletes[2], injury_type='ACL Tear', body_part='Left Knee',
            injury_date=date(2026, 1, 25), severity='Severe', recovery_status='Ongoing Treatment',
            medical_notes='MRI confirmed partial ACL tear.')
        Injury.objects.create(athlete=athletes[0], injury_type='Hamstring Strain', body_part='Right Leg',
            injury_date=date(2026, 2, 5), severity='Moderate', recovery_status='Recovering')
        Injury.objects.create(athlete=athletes[3], injury_type='Ankle Sprain', body_part='Left Ankle',
            injury_date=date(2026, 1, 15), severity='Minor', recovery_status='Recovered')

        # Competitions
        comps = [
            Competition.objects.create(name='State Athletics Championship 2026', sport='Athletics',
                venue='Kanteerava Stadium', competition_date=date(2026, 2, 20), level='State'),
            Competition.objects.create(name='National Swimming Meet 2026', sport='Swimming',
                venue='Aquatic Complex, Delhi', competition_date=date(2026, 3, 10), level='National'),
            Competition.objects.create(name='Badminton State Open', sport='Badminton',
                venue='Indoor Stadium', competition_date=date(2026, 2, 28), level='State'),
        ]
        CompetitionResult.objects.create(competition=comps[0], athlete=athletes[0], position=1, medal='Gold', score='10.45s - 100m')
        CompetitionResult.objects.create(competition=comps[0], athlete=athletes[5], position=2, medal='Silver', score='10.62s - 100m')
        CompetitionResult.objects.create(competition=comps[1], athlete=athletes[1], position=3, medal='Bronze', score='2:05.30')
        CompetitionResult.objects.create(competition=comps[2], athlete=athletes[3], position=1, medal='Gold', score='21-18, 21-15')

        # Attendance
        for i, a in enumerate(athletes):
            status = 'Absent' if i == 2 else ('Late' if i == 4 else 'Present')
            Attendance.objects.create(athlete=a, attendance_date=date(2026, 3, 1), status=status)

        # Weight tracking
        weights = [(72.5, 12.5), (58, 18), (78, 14), (55, 16), (70, 15), (62, 13)]
        for i, a in enumerate(athletes):
            WeightTracking.objects.create(
                athlete=a, record_date=date(2026, 1, 1),
                weight_kg=weights[i][0], height_cm=a.height_cm,
                body_fat_percentage=weights[i][1]
            )

        # Demo student account linked to Rahul Sharma
        if not User.objects.filter(email='rahul.sharma@email.com').exists():
            student = User.objects.create_user(
                username='rahul',
                email='rahul.sharma@email.com',
                password='student123',
                first_name='Rahul',
                last_name='Sharma',
            )
            UserProfile.objects.create(user=student, role='student', athlete=athletes[0])
            self.stdout.write(self.style.SUCCESS('Student: rahul.sharma@email.com / student123'))
        else:
            self.stdout.write(self.style.WARNING('Student demo account already exists'))

        self.stdout.write(self.style.SUCCESS(
            f'Sample data loaded: {len(athletes)} athletes, performances, injuries, competitions, attendance, weight records'
        ))