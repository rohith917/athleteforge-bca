"""
Training Program Builder — coach-authored, day-by-day training programs
assigned to an athlete, built from ordered blocks (warm-up, strength,
speed, ...) each containing ordered exercises.

Separate app from `academy` (education/LMS) and `api` (roster/performance
tracking): this is athlete-facing training prescription, a distinct
concern from either. Links to api.Athlete directly, same pattern academy
already uses for ParentAthleteLink.
"""
from django.contrib.auth.models import User
from django.db import models


class TrainingProgram(models.Model):
    """A coach-built program assigned to one athlete, spanning a date range."""

    STATUS_CHOICES = [
        ('draft', 'Draft'), ('active', 'Active'), ('completed', 'Completed'), ('archived', 'Archived'),
    ]

    name = models.CharField(max_length=200)
    athlete = models.ForeignKey('api.Athlete', on_delete=models.CASCADE, related_name='training_programs')
    coach = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='authored_programs')
    sport = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'training_programs'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} — {self.athlete.full_name}'


class ProgramDay(models.Model):
    """One training day within a program, holding ordered blocks."""

    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE, related_name='days')
    date = models.DateField()
    label = models.CharField(max_length=100, blank=True, default='', help_text='e.g. "Week 1 — Monday"')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'training_program_days'
        ordering = ['order', 'date']
        constraints = [
            models.UniqueConstraint(fields=['program', 'date'], name='unique_program_day_date'),
        ]

    def __str__(self):
        return f'{self.program.name} — {self.date}'


class ProgramBlock(models.Model):
    """An ordered section within a day (warm-up, strength, speed, ...)."""

    BLOCK_TYPE_CHOICES = [
        ('warm_up', 'Warm-Up'), ('activation', 'Activation'), ('strength', 'Strength'),
        ('power', 'Power'), ('plyometrics', 'Plyometrics'), ('speed', 'Speed'),
        ('endurance', 'Endurance'), ('sport_specific', 'Sport-Specific Drills'),
        ('tactical', 'Tactical Session'), ('mobility', 'Mobility'), ('flexibility', 'Flexibility'),
        ('cool_down', 'Cool-Down'), ('recovery', 'Recovery'),
    ]

    day = models.ForeignKey(ProgramDay, on_delete=models.CASCADE, related_name='blocks')
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPE_CHOICES)
    title = models.CharField(max_length=150, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'training_program_blocks'
        ordering = ['order', 'id']

    def __str__(self):
        return self.title or self.get_block_type_display()


class ProgramExercise(models.Model):
    """A single ordered exercise entry within a block."""

    block = models.ForeignKey(ProgramBlock, on_delete=models.CASCADE, related_name='exercises')
    name = models.CharField(max_length=200)
    sets = models.PositiveIntegerField(null=True, blank=True)
    reps = models.CharField(max_length=50, blank=True, default='', help_text='e.g. "8-10", "AMRAP", "30s"')
    load = models.CharField(max_length=50, blank=True, default='', help_text='e.g. "70% 1RM", "bodyweight", "20kg"')
    rest_seconds = models.PositiveIntegerField(null=True, blank=True)
    tempo = models.CharField(max_length=20, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'training_program_exercises'
        ordering = ['order', 'id']

    def __str__(self):
        return self.name


class ExerciseCompletion(models.Model):
    """Athlete's tick-off record for a prescribed exercise on a given day."""

    exercise = models.ForeignKey(ProgramExercise, on_delete=models.CASCADE, related_name='completions')
    athlete = models.ForeignKey('api.Athlete', on_delete=models.CASCADE, related_name='exercise_completions')
    is_completed = models.BooleanField(default=False)
    actual_sets = models.PositiveIntegerField(null=True, blank=True)
    actual_reps = models.CharField(max_length=50, blank=True, default='')
    actual_load = models.CharField(max_length=50, blank=True, default='')
    athlete_notes = models.TextField(blank=True, default='')
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'training_exercise_completions'
        constraints = [
            models.UniqueConstraint(fields=['exercise', 'athlete'], name='unique_exercise_completion'),
        ]

    def __str__(self):
        return f'{self.athlete.full_name} - {self.exercise.name}'
