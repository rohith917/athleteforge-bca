"""
DRF Serializers for all API endpoints.
"""
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import (
    Athlete, Performance, Injury, Competition,
    CompetitionResult, Attendance, WeightTracking
)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for authenticated admin user info."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class AthleteSerializer(serializers.ModelSerializer):
    """Serializer for athlete CRUD operations."""
    full_name = serializers.ReadOnlyField()
    age = serializers.SerializerMethodField()

    class Meta:
        model = Athlete
        fields = '__all__'

    def get_age(self, obj):
        from datetime import date
        today = date.today()
        return today.year - obj.date_of_birth.year - (
            (today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day)
        )


class AthleteListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for athlete list/search."""
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Athlete
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email',
            'sport', 'team', 'status', 'gender', 'date_of_birth'
        ]


class PerformanceSerializer(serializers.ModelSerializer):
    """Serializer for performance records."""
    athlete_name = serializers.CharField(source='athlete.full_name', read_only=True)

    class Meta:
        model = Performance
        fields = '__all__'
        read_only_fields = ['recorded_by', 'created_at']


class InjurySerializer(serializers.ModelSerializer):
    """Serializer for injury records."""
    athlete_name = serializers.CharField(source='athlete.full_name', read_only=True)

    class Meta:
        model = Injury
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class CompetitionResultSerializer(serializers.ModelSerializer):
    """Serializer for competition results."""
    athlete_name = serializers.CharField(source='athlete.full_name', read_only=True)

    class Meta:
        model = CompetitionResult
        fields = '__all__'
        read_only_fields = ['created_at']


class CompetitionSerializer(serializers.ModelSerializer):
    """Serializer for competitions with nested results."""
    results = CompetitionResultSerializer(many=True, read_only=True)
    result_count = serializers.SerializerMethodField()

    class Meta:
        model = Competition
        fields = '__all__'
        read_only_fields = ['created_at']

    def get_result_count(self, obj):
        return obj.results.count()


class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer for attendance records."""
    athlete_name = serializers.CharField(source='athlete.full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['marked_by', 'created_at']


class WeightTrackingSerializer(serializers.ModelSerializer):
    """Serializer for weight/BMI/body fat tracking."""
    athlete_name = serializers.CharField(source='athlete.full_name', read_only=True)
    bmi_category = serializers.SerializerMethodField()

    class Meta:
        model = WeightTracking
        fields = '__all__'
        read_only_fields = ['bmi', 'created_at']

    def get_bmi_category(self, obj):
        if not obj.bmi:
            return 'Unknown'
        bmi = float(obj.bmi)
        if bmi < 18.5:
            return 'Underweight'
        elif bmi < 25:
            return 'Normal'
        elif bmi < 30:
            return 'Overweight'
        return 'Obese'


class LoginSerializer(serializers.Serializer):
    """Serializer for admin login."""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics."""
    total_athletes = serializers.IntegerField()
    active_athletes = serializers.IntegerField()
    injured_athletes = serializers.IntegerField()
    active_injuries = serializers.IntegerField()
    total_competitions = serializers.IntegerField()
    gold_medals = serializers.IntegerField()
    silver_medals = serializers.IntegerField()
    bronze_medals = serializers.IntegerField()
    avg_performance = serializers.DictField()
    sport_distribution = serializers.ListField()
    injury_by_severity = serializers.ListField()
    monthly_attendance = serializers.ListField()
    performance_trend = serializers.ListField()