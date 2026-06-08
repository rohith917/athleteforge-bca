"""
DRF Serializers for all API endpoints.
"""
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import (
    Athlete, Performance, Injury, Competition,
    CompetitionResult, Attendance, WeightTracking, UserProfile, PasswordResetToken
)
from .permissions import get_user_role, get_athlete_for_user, is_admin_role


class UserSerializer(serializers.ModelSerializer):
    """Authenticated user with role and linked athlete."""

    role = serializers.SerializerMethodField()
    athlete_id = serializers.SerializerMethodField()
    athlete_name = serializers.SerializerMethodField()
    profile_photo = serializers.SerializerMethodField()
    is_staff_role = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'athlete_id', 'athlete_name', 'profile_photo', 'is_staff_role', 'is_admin',
        ]

    def get_role(self, obj):
        return get_user_role(obj)

    def get_athlete_id(self, obj):
        athlete = get_athlete_for_user(obj)
        return athlete.id if athlete else None

    def get_athlete_name(self, obj):
        athlete = get_athlete_for_user(obj)
        return athlete.full_name if athlete else None

    def get_profile_photo(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile and profile.profile_photo:
            return profile.profile_photo.url
        athlete = get_athlete_for_user(obj)
        if athlete and athlete.photo:
            return athlete.photo.url
        return None

    def get_is_staff_role(self, obj):
        from .permissions import is_staff_role
        return is_staff_role(obj)

    def get_is_admin(self, obj):
        return is_admin_role(obj)


class AthleteSerializer(serializers.ModelSerializer):
    """Serializer for athlete CRUD operations."""
    full_name = serializers.ReadOnlyField()
    age = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Athlete
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'date_of_birth', 'age', 'gender', 'sport', 'team', 'height_cm',
            'address', 'emergency_contact', 'emergency_phone', 'status', 'photo',
            'avatar_url', 'created_at', 'updated_at',
        ]

    def get_age(self, obj):
        from datetime import date
        today = date.today()
        return today.year - obj.date_of_birth.year - (
            (today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day)
        )

    def get_avatar_url(self, obj):
        if obj.photo:
            return obj.photo.url
        name = obj.full_name.replace(' ', '+')
        return f"https://ui-avatars.com/api/?name={name}&background=0A1428&color=00D4FF&size=128&bold=true"


class AthleteListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for athlete list/search."""
    full_name = serializers.ReadOnlyField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Athlete
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email',
            'sport', 'team', 'status', 'gender', 'date_of_birth', 'avatar_url',
        ]

    def get_avatar_url(self, obj):
        if obj.photo:
            return obj.photo.url
        name = obj.full_name.replace(' ', '+')
        return f"https://ui-avatars.com/api/?name={name}&background=0A1428&color=00D4FF&size=128&bold=true"


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
    """Login with email or username + password."""
    email = serializers.EmailField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        if not data.get('email') and not data.get('username'):
            raise serializers.ValidationError('Email or username is required.')
        return data


class RegisterSerializer(serializers.Serializer):
    """Self-registration as Coach or Student/Athlete."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=['coach', 'student'], default='student')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value.lower()

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        try:
            validate_password(data['password'])
        except Exception as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return data

    def create(self, validated_data):
        email = validated_data['email']
        username = email.split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data.get('last_name', ''),
        )

        role = validated_data.get('role', 'student')
        athlete = None
        if role == 'student':
            athlete = Athlete.objects.filter(email__iexact=email).first()
        UserProfile.objects.create(user=user, role=role, athlete=athlete)
        return user


class ForgotPasswordSerializer(serializers.Serializer):
    """Request password reset token."""
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    """Reset password with token."""
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        try:
            validate_password(data['password'])
        except Exception as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return data

    def validate_token(self, value):
        try:
            token_obj = PasswordResetToken.objects.get(token=value)
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError('Invalid or expired reset token.')
        if not token_obj.is_valid():
            raise serializers.ValidationError('Invalid or expired reset token.')
        return value


class AdminUserSerializer(serializers.ModelSerializer):
    """Full user record for admin management panel."""

    role = serializers.SerializerMethodField()
    athlete_id = serializers.SerializerMethodField()
    athlete_name = serializers.SerializerMethodField()
    is_active = serializers.BooleanField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'athlete_id', 'athlete_name', 'is_active',
            'is_superuser', 'last_login', 'date_joined',
        ]

    def get_role(self, obj):
        return get_user_role(obj)

    def get_athlete_id(self, obj):
        athlete = get_athlete_for_user(obj)
        return athlete.id if athlete else None

    def get_athlete_name(self, obj):
        athlete = get_athlete_for_user(obj)
        return athlete.full_name if athlete else None


class AdminUserUpdateSerializer(serializers.Serializer):
    """Admin updates user role, athlete link, or active status."""
    role = serializers.ChoiceField(choices=['admin', 'coach', 'student'], required=False)
    athlete_id = serializers.IntegerField(required=False, allow_null=True)
    is_active = serializers.BooleanField(required=False)
    first_name = serializers.CharField(max_length=100, required=False)
    last_name = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def validate_athlete_id(self, value):
        if value is not None and not Athlete.objects.filter(pk=value).exists():
            raise serializers.ValidationError('Athlete not found.')
        return value


class AdminCreateUserSerializer(serializers.Serializer):
    """Admin creates coach or student accounts."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=['coach', 'student'], default='coach')
    athlete_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value.lower()

    def validate_athlete_id(self, value):
        if value is not None and not Athlete.objects.filter(pk=value).exists():
            raise serializers.ValidationError('Athlete not found.')
        return value

    def create(self, validated_data):
        email = validated_data['email']
        username = email.split('@')[0]
        base = username
        n = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{n}"
            n += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data.get('last_name', ''),
        )
        athlete = None
        if validated_data.get('athlete_id'):
            athlete = Athlete.objects.get(pk=validated_data['athlete_id'])
        elif validated_data['role'] == 'student':
            athlete = Athlete.objects.filter(email__iexact=email).first()

        UserProfile.objects.create(
            user=user,
            role=validated_data['role'],
            athlete=athlete,
        )
        return user


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