"""
Rule-based AI insights for AthleteForge (viva demo).
Uses performance trends, injury history, and attendance — no external LLM.
"""
from datetime import date, timedelta
from django.db.models import Avg


def _pct_change(old_val, new_val):
    if not old_val or old_val == 0:
        return 0
    return round(((float(new_val) - float(old_val)) / float(old_val)) * 100, 1)


def generate_performance_insights(athlete):
    """Compare latest vs previous performance and suggest training focus."""
    records = list(athlete.performances.order_by('-record_date')[:2])
    if len(records) < 2:
        return {
            'available': False,
            'message': 'Record at least two performance entries for AI insights.',
        }

    latest, previous = records[0], records[1]
    metrics = [
        ('speed', 'Speed', latest.speed_score, previous.speed_score, 'sprint drills'),
        ('strength', 'Strength', latest.strength_score, previous.strength_score, 'resistance training'),
        ('endurance', 'Endurance', latest.endurance_score, previous.endurance_score, 'cardio sessions'),
        ('flexibility', 'Flexibility', latest.flexibility_score, previous.flexibility_score, 'mobility work'),
        ('agility', 'Agility', latest.agility_score, previous.agility_score, 'agility ladder drills'),
    ]

    changes = []
    for key, label, cur, prev, suggestion in metrics:
        if cur is not None and prev is not None:
            pct = _pct_change(prev, cur)
            changes.append({
                'metric': key,
                'label': label,
                'change_percent': pct,
                'current': float(cur),
                'previous': float(prev),
                'trend': 'up' if pct > 0 else 'down' if pct < 0 else 'stable',
            })

    if not changes:
        return {'available': False, 'message': 'Insufficient performance data.'}

    best = max(changes, key=lambda x: x['change_percent'])
    weakest = min(changes, key=lambda x: x['change_percent'])

    recommendation = (
        f"Your {best['label'].lower()} improved by {abs(best['change_percent'])}%. "
        f"Focus area: {weakest['label'].lower()} "
        f"({'increase' if weakest['change_percent'] < 0 else 'maintain'} "
        f"{metrics[[m[0] for m in metrics].index(weakest['metric'])][4]})."
    )

    return {
        'available': True,
        'headline': f"{best['label']} up {best['change_percent']}%",
        'recommendation': recommendation,
        'metrics': changes,
        'confidence': 'high' if len(changes) >= 4 else 'medium',
    }


def generate_injury_risk_alert(athlete):
    """Warn based on recent injuries and recovery status."""
    recent_cutoff = date.today() - timedelta(days=90)
    injuries = athlete.injuries.filter(injury_date__gte=recent_cutoff)
    active = injuries.exclude(recovery_status='Recovered')

    if not injuries.exists():
        return {
            'risk_level': 'low',
            'alert': False,
            'message': 'No recent injuries. Keep up preventive warm-ups and recovery.',
        }

    severe_count = active.filter(severity='Severe').count()
    moderate_count = active.filter(severity='Moderate').count()

    if severe_count > 0:
        risk = 'high'
        msg = (
            f"High injury risk: {severe_count} severe active injury(ies) in the last 90 days. "
            "Reduce training load and consult sports medicine before intense sessions."
        )
    elif moderate_count >= 2 or active.count() >= 2:
        risk = 'medium'
        msg = (
            f"Moderate injury risk: {active.count()} active injuries detected. "
            "Prioritize recovery sessions and avoid overtraining the affected areas."
        )
    elif active.exists():
        risk = 'medium'
        msg = (
            "One active injury on record. Monitor symptoms and follow your treatment plan."
        )
    else:
        risk = 'low'
        msg = "Recent injuries are recovered. Maintain strength and flexibility to prevent recurrence."

    return {
        'risk_level': risk,
        'alert': risk in ('medium', 'high'),
        'message': msg,
        'active_injuries': active.count(),
        'recent_injuries': injuries.count(),
    }


def generate_progress_summary(athlete):
    """Overall progress summary from performance, attendance, and weight."""
    performances = athlete.performances.order_by('-record_date')[:6]
    attendance = athlete.attendance_records.filter(
        attendance_date__gte=date.today() - timedelta(days=60)
    )
    total_att = attendance.count()
    present = attendance.filter(status='Present').count()
    att_rate = round((present / total_att * 100) if total_att > 0 else 0, 1)

    avg_scores = performances.aggregate(
        speed=Avg('speed_score'),
        strength=Avg('strength_score'),
        endurance=Avg('endurance_score'),
        flexibility=Avg('flexibility_score'),
        agility=Avg('agility_score'),
    )
    score_vals = [float(v) for v in avg_scores.values() if v is not None]
    overall_avg = round(sum(score_vals) / len(score_vals), 1) if score_vals else 0

    if overall_avg >= 85:
        performance_grade = 'Excellent'
    elif overall_avg >= 70:
        performance_grade = 'Good'
    elif overall_avg >= 55:
        performance_grade = 'Developing'
    else:
        performance_grade = 'Needs Improvement'

    summary_parts = [
        f"Overall performance grade: {performance_grade} (avg {overall_avg}/100).",
        f"Attendance rate (60 days): {att_rate}%.",
    ]

    injury_alert = generate_injury_risk_alert(athlete)
    if injury_alert['alert']:
        summary_parts.append(f"Injury status: {injury_alert['risk_level']} risk — take precautions.")

    return {
        'overall_average': overall_avg,
        'performance_grade': performance_grade,
        'attendance_rate': att_rate,
        'sessions_recorded': total_att,
        'summary': ' '.join(summary_parts),
        'injury_risk': injury_alert['risk_level'],
    }


def get_ai_insights_for_athlete(athlete):
    """Bundle all AI features for one athlete."""
    return {
        'athlete_id': athlete.id,
        'athlete_name': athlete.full_name,
        'performance_insights': generate_performance_insights(athlete),
        'injury_risk': generate_injury_risk_alert(athlete),
        'progress_summary': generate_progress_summary(athlete),
    }