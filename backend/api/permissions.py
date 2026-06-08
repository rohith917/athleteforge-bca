"""
Role-based permissions for AthleteForge.
Coach/Admin: full access. Student: own data only (read-only).
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS

ROLE_ADMIN = 'admin'
ROLE_COACH = 'coach'
ROLE_STUDENT = 'student'


def get_user_profile(user):
    """Return UserProfile or None."""
    if not user or not user.is_authenticated:
        return None
    return getattr(user, 'profile', None)


def get_user_role(user):
    """Resolve role: superuser → admin, else profile role, default coach for legacy users."""
    if user.is_superuser:
        return ROLE_ADMIN
    profile = get_user_profile(user)
    if profile:
        return profile.role
    return ROLE_COACH


def is_staff_role(user):
    """Coach, admin, or superuser."""
    return get_user_role(user) in (ROLE_ADMIN, ROLE_COACH) or user.is_superuser


def get_athlete_for_user(user):
    """Linked athlete for student accounts."""
    profile = get_user_profile(user)
    return profile.athlete if profile else None


class IsCoachOrAdmin(BasePermission):
    """Write operations restricted to coach/admin."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and is_staff_role(request.user)


class IsStudentOrStaff(BasePermission):
    """Any authenticated user."""

    def has_permission(self, request, view):
        return request.user.is_authenticated


class ReadOnlyForStudents(BasePermission):
    """Students may only use safe HTTP methods."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if is_staff_role(request.user):
            return True
        return request.method in SAFE_METHODS


def filter_queryset_by_role(queryset, user, athlete_field='athlete'):
    """Filter queryset to student's own athlete data."""
    if is_staff_role(user):
        return queryset
    athlete = get_athlete_for_user(user)
    if athlete:
        return queryset.filter(**{f'{athlete_field}_id': athlete.id})
    return queryset.none()


def filter_athletes_by_role(queryset, user):
    """Students see only their linked athlete profile."""
    if is_staff_role(user):
        return queryset
    athlete = get_athlete_for_user(user)
    if athlete:
        return queryset.filter(pk=athlete.pk)
    return queryset.none()