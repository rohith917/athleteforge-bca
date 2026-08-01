from django.contrib import admin

from .models import (
    TrainingProgram, ProgramDay, ProgramBlock, ProgramExercise, ExerciseCompletion,
    WellnessCheckIn, SessionRPE, NutritionLog,
)


class ProgramDayInline(admin.TabularInline):
    model = ProgramDay
    extra = 1


@admin.register(TrainingProgram)
class TrainingProgramAdmin(admin.ModelAdmin):
    list_display = ('name', 'athlete', 'coach', 'status', 'start_date', 'end_date')
    list_filter = ('status',)
    search_fields = ('name', 'athlete__first_name', 'athlete__last_name')
    inlines = [ProgramDayInline]


class ProgramBlockInline(admin.TabularInline):
    model = ProgramBlock
    extra = 1


@admin.register(ProgramDay)
class ProgramDayAdmin(admin.ModelAdmin):
    list_display = ('program', 'date', 'label', 'order')
    inlines = [ProgramBlockInline]


class ProgramExerciseInline(admin.TabularInline):
    model = ProgramExercise
    extra = 1


@admin.register(ProgramBlock)
class ProgramBlockAdmin(admin.ModelAdmin):
    list_display = ('day', 'block_type', 'title', 'order')
    inlines = [ProgramExerciseInline]


admin.site.register(ProgramExercise)
admin.site.register(ExerciseCompletion)


@admin.register(WellnessCheckIn)
class WellnessCheckInAdmin(admin.ModelAdmin):
    list_display = ('athlete', 'date', 'sleep_quality', 'fatigue', 'soreness', 'stress', 'mood')
    list_filter = ('date',)
    search_fields = ('athlete__first_name', 'athlete__last_name')


@admin.register(SessionRPE)
class SessionRPEAdmin(admin.ModelAdmin):
    list_display = ('athlete', 'session_date', 'rpe', 'duration_minutes', 'session_type')
    list_filter = ('session_date',)
    search_fields = ('athlete__first_name', 'athlete__last_name')


@admin.register(NutritionLog)
class NutritionLogAdmin(admin.ModelAdmin):
    list_display = ('athlete', 'date', 'water_intake_ml', 'calories', 'protein_g', 'carbs_g', 'fat_g')
    list_filter = ('date',)
    search_fields = ('athlete__first_name', 'athlete__last_name')
