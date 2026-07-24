"""
Django Admin configuration for all models.
"""
from django.contrib import admin
from .models import (
    Athlete, Performance, Injury, Competition,
    CompetitionResult, Attendance, WeightTracking,
    UserProfile, PasswordResetToken, Goal, Announcement, Notification, ContactInquiry,
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'athlete', 'phone']
    list_filter = ['role']
    search_fields = ['user__username', 'user__email']


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'created_at', 'expires_at', 'used']
    list_filter = ['used']


@admin.register(Athlete)
class AthleteAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'sport', 'team', 'gender', 'status', 'phone']
    list_filter = ['sport', 'status', 'gender']
    search_fields = ['first_name', 'last_name', 'email', 'sport']


@admin.register(Performance)
class PerformanceAdmin(admin.ModelAdmin):
    list_display = ['athlete', 'record_date', 'speed_score', 'strength_score', 'endurance_score']
    list_filter = ['record_date']
    search_fields = ['athlete__first_name', 'athlete__last_name']


@admin.register(Injury)
class InjuryAdmin(admin.ModelAdmin):
    list_display = ['athlete', 'injury_type', 'body_part', 'severity', 'recovery_status', 'injury_date']
    list_filter = ['severity', 'recovery_status']
    search_fields = ['athlete__first_name', 'injury_type']


class CompetitionResultInline(admin.TabularInline):
    model = CompetitionResult
    extra = 1


@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ['name', 'sport', 'competition_date', 'level', 'venue']
    list_filter = ['level', 'sport']
    inlines = [CompetitionResultInline]


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['athlete', 'attendance_date', 'status', 'session_type']
    list_filter = ['status', 'session_type', 'attendance_date']


@admin.register(WeightTracking)
class WeightTrackingAdmin(admin.ModelAdmin):
    list_display = ['athlete', 'record_date', 'weight_kg', 'bmi', 'body_fat_percentage']
    list_filter = ['record_date']


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['athlete', 'metric', 'target_value', 'target_date', 'status']
    list_filter = ['metric', 'status']
    search_fields = ['athlete__first_name', 'athlete__last_name']


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'audience', 'team_filter', 'pinned', 'created_by', 'created_at']
    list_filter = ['audience', 'pinned']
    search_fields = ['title', 'message']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'notif_type', 'severity', 'title', 'is_read', 'created_at']
    list_filter = ['notif_type', 'severity', 'is_read']
    search_fields = ['recipient__username', 'title']


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'organization', 'is_read', 'created_at']
    list_filter = ['is_read']
    search_fields = ['name', 'email', 'organization', 'message']