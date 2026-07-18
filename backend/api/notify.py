"""
Notification helpers: create persisted per-user notifications, and compute
live (non-persisted) alerts from current data — upcoming competitions,
active injuries — merged into the notification feed at read time.
"""
from datetime import date, timedelta

from django.contrib.auth.models import User
from django.db.models import Q

from .models import Notification, UserProfile, Competition


def notify_user(recipient, notif_type, severity, title, message='', link=''):
    if not recipient:
        return None
    return Notification.objects.create(
        recipient=recipient, notif_type=notif_type, severity=severity,
        title=title, message=message, link=link,
    )


def notify_athlete_user(athlete, notif_type, severity, title, message='', link=''):
    profile = UserProfile.objects.filter(athlete=athlete).select_related('user').first()
    if profile:
        return notify_user(profile.user, notif_type, severity, title, message, link)
    return None


def notify_staff(notif_type, severity, title, message='', link=''):
    from .permissions import is_staff_role
    recipients = [u for u in User.objects.filter(is_active=True) if is_staff_role(u)]
    Notification.objects.bulk_create([
        Notification(recipient=u, notif_type=notif_type, severity=severity, title=title, message=message, link=link)
        for u in recipients
    ])


def recipients_for_announcement(announcement):
    """Active users matching an announcement's target audience."""
    qs = User.objects.filter(is_active=True).select_related('profile')
    if announcement.audience == 'students':
        return qs.filter(profile__role='student')
    if announcement.audience == 'coaches':
        return qs.filter(Q(profile__role__in=['coach', 'admin']) | Q(is_superuser=True))
    if announcement.audience == 'team':
        if not announcement.team_filter:
            return qs.none()
        return qs.filter(profile__athlete__team__iexact=announcement.team_filter)
    return qs


def notify_recipients_for_announcement(announcement):
    recipients = list(recipients_for_announcement(announcement))
    Notification.objects.bulk_create([
        Notification(
            recipient=u, notif_type='announcement', severity='info',
            title=announcement.title, message=announcement.message[:280],
            link='/dashboard/announcements',
        )
        for u in recipients
    ])


def live_alerts_for_user(user, athlete):
    """Ephemeral, always-fresh alerts computed from current data (not persisted)."""
    from .permissions import is_staff_role
    from .models import Injury

    alerts = []
    today = date.today()
    horizon = today + timedelta(days=7)

    if is_staff_role(user):
        upcoming = Competition.objects.filter(
            competition_date__gte=today, competition_date__lte=horizon
        ).order_by('competition_date')[:8]
        for comp in upcoming:
            days = (comp.competition_date - today).days
            alerts.append(_alert(
                f'live-comp-{comp.id}', 'competition',
                'warning' if days <= 2 else 'info',
                f'{comp.name} in {days} day{"s" if days != 1 else ""}',
                f'{comp.sport} · {comp.venue or "Venue TBA"}',
                '/dashboard/competitions', comp.created_at,
            ))

        risky = Injury.objects.exclude(recovery_status='Recovered').filter(
            severity__in=['Moderate', 'Severe']
        ).select_related('athlete').order_by('-updated_at')[:8]
        for inj in risky:
            alerts.append(_alert(
                f'live-injury-{inj.id}', 'injury',
                'danger' if inj.severity == 'Severe' else 'warning',
                f'{inj.athlete.full_name}: {inj.injury_type}',
                f'{inj.severity} · {inj.recovery_status}',
                f'/dashboard/athletes/{inj.athlete_id}', inj.updated_at,
            ))
    elif athlete:
        upcoming = Competition.objects.filter(
            sport__iexact=athlete.sport, competition_date__gte=today, competition_date__lte=horizon,
        ).order_by('competition_date')[:5]
        for comp in upcoming:
            days = (comp.competition_date - today).days
            alerts.append(_alert(
                f'live-comp-{comp.id}', 'competition', 'info',
                f'{comp.name} in {days} day{"s" if days != 1 else ""}',
                f'{comp.sport} · {comp.venue or "Venue TBA"}',
                '/dashboard/competitions', comp.created_at,
            ))

        for inj in athlete.injuries.exclude(recovery_status='Recovered')[:3]:
            alerts.append(_alert(
                f'live-injury-{inj.id}', 'injury',
                'danger' if inj.severity == 'Severe' else 'warning',
                f'Active injury: {inj.injury_type}',
                f'{inj.severity} · {inj.recovery_status}',
                '/dashboard/injuries', inj.updated_at,
            ))

    return alerts


def _alert(alert_id, notif_type, severity, title, message, link, created_at):
    return {
        'id': alert_id,
        'notif_type': notif_type,
        'severity': severity,
        'title': title,
        'message': message,
        'link': link,
        'is_read': True,
        'live': True,
        'created_at': created_at.isoformat(),
    }
