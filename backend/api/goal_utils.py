"""
Goal progress computation — derives current metric value from real
performance/weight/attendance records and compares against the target.
"""
from datetime import date, timedelta

PERFORMANCE_METRICS = {
    'speed_score', 'strength_score', 'endurance_score', 'flexibility_score', 'agility_score',
}


def get_current_metric_value(athlete, metric):
    """Latest known value for a goal's metric, or None if no data yet."""
    if metric in PERFORMANCE_METRICS:
        latest = athlete.performances.exclude(**{f'{metric}__isnull': True}).order_by('-record_date').first()
        value = getattr(latest, metric, None) if latest else None
        return float(value) if value is not None else None

    if metric == 'weight_kg':
        latest = athlete.weight_records.first()
        return float(latest.weight_kg) if latest else None

    if metric == 'attendance_rate':
        cutoff = date.today() - timedelta(days=30)
        records = athlete.attendance_records.filter(attendance_date__gte=cutoff)
        total = records.count()
        if not total:
            return None
        present = records.filter(status='Present').count()
        return round((present / total) * 100, 1)

    return None


def compute_goal_progress(goal):
    """Returns {current_value, percent, achieved, days_left} for a goal."""
    current = get_current_metric_value(goal.athlete, goal.metric)
    target = float(goal.target_value)
    days_left = (goal.target_date - date.today()).days

    if current is None:
        return {'current_value': None, 'percent': 0.0, 'achieved': False, 'days_left': days_left}

    start = float(goal.start_value) if goal.start_value is not None else current
    increasing = target >= start

    if start == target:
        percent = 100.0 if current >= target else 0.0
    else:
        percent = ((current - start) / (target - start)) * 100
    percent = max(0.0, min(100.0, round(percent, 1)))

    achieved = (current >= target) if increasing else (current <= target)

    return {
        'current_value': current,
        'percent': percent,
        'achieved': achieved,
        'days_left': days_left,
    }


def refresh_goal_status(goal):
    """Recompute progress and flip status to achieved/missed on transition. Returns progress dict."""
    progress = compute_goal_progress(goal)

    if goal.status == 'active':
        if progress['achieved']:
            from django.utils import timezone
            goal.status = 'achieved'
            goal.achieved_at = timezone.now()
            goal.save(update_fields=['status', 'achieved_at'])
            _notify_goal_achieved(goal)
        elif progress['days_left'] < 0:
            goal.status = 'missed'
            goal.save(update_fields=['status'])

    return progress


def _notify_goal_achieved(goal):
    from .notify import notify_athlete_user, notify_user
    title = f"Goal achieved: {goal.get_metric_display()}"
    message = f"{goal.athlete.full_name} hit their {goal.get_metric_display().lower()} target of {goal.target_value}."
    notify_athlete_user(goal.athlete, 'goal', 'success', title, message, link='/dashboard')
    if goal.created_by:
        notify_user(goal.created_by, 'goal', 'success', title, message, link=f'/dashboard/athletes/{goal.athlete_id}')
