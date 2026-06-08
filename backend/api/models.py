"""
Database models for Athlete Performance and Injury Tracking System.
Maps to MySQL tables: athletes, performance, injuries, competitions,
attendance, weight_tracking
"""
from django.db import models
from django.contrib.auth.models import User


class Athlete(models.Model):
    """Athlete profile with personal and sports information."""

    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Injured', 'Injured'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')
    sport = models.CharField(max_length=100)
    team = models.CharField(max_length=100, blank=True, default='')
    height_cm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    address = models.TextField(blank=True, default='')
    emergency_contact = models.CharField(max_length=100, blank=True, default='')
    emergency_phone = models.CharField(max_length=20, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    photo = models.ImageField(upload_to='athletes/', blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'athletes'
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Performance(models.Model):
    """Performance metrics: speed, strength, endurance, flexibility, agility."""

    athlete = models.ForeignKey(Athlete, on_delete=models.CASCADE, related_name='performances')
    record_date = models.DateField()
    speed_score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    strength_score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    endurance_score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    flexibility_score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    agility_score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    speed_value = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    strength_value = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    endurance_value = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    flexibility_value = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    agility_value = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'performance'
        ordering = ['-record_date']

    def __str__(self):
        return f"{self.athlete} - {self.record_date}"


class Injury(models.Model):
    """Injury records with recovery status and medical notes."""

    SEVERITY_CHOICES = [
        ('Minor', 'Minor'),
        ('Moderate', 'Moderate'),
        ('Severe', 'Severe'),
    ]
    RECOVERY_CHOICES = [
        ('Recovering', 'Recovering'),
        ('Recovered', 'Recovered'),
        ('Ongoing Treatment', 'Ongoing Treatment'),
    ]

    athlete = models.ForeignKey(Athlete, on_delete=models.CASCADE, related_name='injuries')
    injury_type = models.CharField(max_length=150)
    body_part = models.CharField(max_length=100)
    injury_date = models.DateField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='Minor')
    recovery_status = models.CharField(max_length=30, choices=RECOVERY_CHOICES, default='Recovering')
    expected_recovery_date = models.DateField(null=True, blank=True)
    actual_recovery_date = models.DateField(null=True, blank=True)
    medical_notes = models.TextField(blank=True, default='')
    treatment_plan = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'injuries'
        ordering = ['-injury_date']

    def __str__(self):
        return f"{self.athlete} - {self.injury_type}"


class Competition(models.Model):
    """Competition/event information."""

    LEVEL_CHOICES = [
        ('Local', 'Local'),
        ('State', 'State'),
        ('National', 'National'),
        ('International', 'International'),
    ]

    name = models.CharField(max_length=200)
    sport = models.CharField(max_length=100)
    venue = models.CharField(max_length=200, blank=True, default='')
    competition_date = models.DateField()
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='Local')
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'competitions'
        ordering = ['-competition_date']

    def __str__(self):
        return self.name


class CompetitionResult(models.Model):
    """Competition results and medal tracking per athlete."""

    MEDAL_CHOICES = [
        ('Gold', 'Gold'),
        ('Silver', 'Silver'),
        ('Bronze', 'Bronze'),
        ('None', 'None'),
    ]

    competition = models.ForeignKey(Competition, on_delete=models.CASCADE, related_name='results')
    athlete = models.ForeignKey(Athlete, on_delete=models.CASCADE, related_name='competition_results')
    position = models.IntegerField(null=True, blank=True)
    medal = models.CharField(max_length=10, choices=MEDAL_CHOICES, default='None')
    score = models.CharField(max_length=100, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'competition_results'
        ordering = ['position']

    def __str__(self):
        return f"{self.athlete} - {self.competition.name}"


class Attendance(models.Model):
    """Training/competition attendance records."""

    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
        ('Excused', 'Excused'),
    ]
    SESSION_CHOICES = [
        ('Training', 'Training'),
        ('Competition', 'Competition'),
        ('Recovery', 'Recovery'),
        ('Other', 'Other'),
    ]

    athlete = models.ForeignKey(Athlete, on_delete=models.CASCADE, related_name='attendance_records')
    attendance_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Present')
    session_type = models.CharField(max_length=20, choices=SESSION_CHOICES, default='Training')
    notes = models.TextField(blank=True, default='')
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attendance'
        unique_together = ['athlete', 'attendance_date', 'session_type']
        ordering = ['-attendance_date']

    def __str__(self):
        return f"{self.athlete} - {self.attendance_date} ({self.status})"


class WeightTracking(models.Model):
    """Weight, BMI, and body fat percentage tracking."""

    athlete = models.ForeignKey(Athlete, on_delete=models.CASCADE, related_name='weight_records')
    record_date = models.DateField()
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2)
    height_cm = models.DecimalField(max_digits=5, decimal_places=2)
    bmi = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    body_fat_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    muscle_mass_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'weight_tracking'
        ordering = ['-record_date']

    def save(self, *args, **kwargs):
        """Auto-calculate BMI: weight(kg) / height(m)^2"""
        if self.weight_kg and self.height_cm:
            height_m = float(self.height_cm) / 100
            self.bmi = round(float(self.weight_kg) / (height_m ** 2), 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.athlete} - {self.record_date} ({self.weight_kg}kg)"