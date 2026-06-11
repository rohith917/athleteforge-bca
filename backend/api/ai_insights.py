"""
Rule-based AI insights for AthleteForge — rich analytics without external LLM.
Fuses performance, injuries, attendance, weight, and competition data.
"""
from datetime import date, timedelta
from django.db.models import Avg

from .models import Athlete, CompetitionResult


METRIC_DEFS = [
    ('speed', 'Speed', 'sprint intervals & acceleration drills'),
    ('strength', 'Strength', 'compound lifts & plyometrics'),
    ('endurance', 'Endurance', 'tempo runs & aerobic base work'),
    ('flexibility', 'Flexibility', 'dynamic mobility & yoga flows'),
    ('agility', 'Agility', 'ladder drills & change-of-direction work'),
]


def _pct_change(old_val, new_val):
    if not old_val or old_val == 0:
        return 0
    return round(((float(new_val) - float(old_val)) / float(old_val)) * 100, 1)


def _score_performance(values):
    if not values:
        return 0
    return round(sum(values) / len(values), 1)


def generate_performance_insights(athlete):
    """Compare latest vs previous + 6-session trend."""
    records = list(athlete.performances.order_by('-record_date')[:6])
    if len(records) < 2:
        return {
            'available': False,
            'message': 'Record at least two performance entries for full AI analysis.',
            'sessions_analyzed': len(records),
        }

    latest, previous = records[0], records[1]
    changes = []
    for key, label, suggestion in METRIC_DEFS:
        cur = getattr(latest, f'{key}_score', None)
        prev = getattr(previous, f'{key}_score', None)
        if cur is not None and prev is not None:
            pct = _pct_change(prev, cur)
            changes.append({
                'metric': key,
                'label': label,
                'change_percent': pct,
                'current': float(cur),
                'previous': float(prev),
                'trend': 'up' if pct > 2 else 'down' if pct < -2 else 'stable',
                'suggestion': suggestion,
            })

    if not changes:
        return {'available': False, 'message': 'Insufficient scored performance data.'}

    best = max(changes, key=lambda x: x['change_percent'])
    weakest = min(changes, key=lambda x: x['change_percent'])
    improving = [c for c in changes if c['trend'] == 'up']
    declining = [c for c in changes if c['trend'] == 'down']

    trend_history = []
    for rec in reversed(records[:6]):
        vals = [float(getattr(rec, f'{m[0]}_score')) for m in METRIC_DEFS
                if getattr(rec, f'{m[0]}_score') is not None]
        trend_history.append({
            'date': rec.record_date.isoformat(),
            'composite': _score_performance(vals),
        })

    recommendation = (
        f"Top gain: {best['label']} (+{best['change_percent']}%) — sustain with sport-specific work. "
        f"Priority focus: {weakest['label']} ({weakest['change_percent']:+.1f}%) — add 2× weekly "
        f"{weakest['suggestion']}. "
        f"Across {len(records)} sessions: {len(improving)} metrics improving, "
        f"{len(declining)} declining."
    )

    return {
        'available': True,
        'headline': f"{best['label']} leading at +{best['change_percent']}%",
        'recommendation': recommendation,
        'metrics': changes,
        'confidence': 'high' if len(changes) >= 4 else 'medium',
        'sessions_analyzed': len(records),
        'improving_count': len(improving),
        'declining_count': len(declining),
        'trend_history': trend_history,
        'latest_date': latest.record_date.isoformat(),
        'weakest_metric': weakest['label'],
        'strongest_metric': best['label'],
    }


def generate_injury_risk_alert(athlete):
    """Detailed injury risk with history and prevention plan."""
    recent_cutoff = date.today() - timedelta(days=90)
    injuries = list(athlete.injuries.filter(injury_date__gte=recent_cutoff).order_by('-injury_date'))
    active = [i for i in injuries if i.recovery_status != 'Recovered']

    injury_details = [{
        'type': i.injury_type,
        'body_part': i.body_part,
        'severity': i.severity,
        'status': i.recovery_status,
        'date': i.injury_date.isoformat(),
        'expected_recovery': i.expected_recovery_date.isoformat() if i.expected_recovery_date else None,
        'notes': (i.medical_notes or i.treatment_plan or '')[:200],
    } for i in injuries[:5]]

    prevention_tips = [
        '10-minute dynamic warm-up before every session (leg swings, A-skips, band activation).',
        '48-hour recovery window between max-effort speed or strength sessions.',
        'Sleep 7–9 hours — tissue repair peaks in deep sleep phases.',
        'Hydrate 35–40 ml per kg body weight daily during training blocks.',
    ]

    if not injuries:
        return {
            'risk_level': 'low',
            'risk_score': 12,
            'alert': False,
            'message': (
                'No injuries in the last 90 days. Injury risk is LOW. '
                'Continue preventive mobility work and monitor training load weekly.'
            ),
            'active_injuries': 0,
            'recent_injuries': 0,
            'injury_history': [],
            'prevention_tips': prevention_tips,
            'risk_factors': ['Clean injury record — maintain current prevention protocol'],
        }

    severe = sum(1 for i in active if i.severity == 'Severe')
    moderate = sum(1 for i in active if i.severity == 'Moderate')
    body_parts = list({i.body_part for i in active})

    if severe > 0:
        risk, score = 'high', 78
        msg = (
            f"HIGH RISK ({score}/100): {severe} severe active injury(ies) on "
            f"{', '.join(body_parts) or 'record'}. Halt high-intensity training. "
            f"Medical clearance required before return-to-play. "
            f"{len(active)} active of {len(injuries)} recent injuries."
        )
        prevention_tips.insert(0, 'Immediate: reduce load 40–60% until pain-free ROM achieved.')
    elif moderate >= 2 or len(active) >= 2:
        risk, score = 'medium', 52
        msg = (
            f"MODERATE RISK ({score}/100): {len(active)} active injuries "
            f"({', '.join(body_parts)}). Prioritize rehab sessions 3×/week. "
            f"Avoid loading affected areas above 70% max."
        )
    elif active:
        risk, score = 'medium', 38
        msg = (
            f"MODERATE RISK ({score}/100): 1 active injury ({active[0].injury_type} — "
            f"{active[0].body_part}). Follow treatment plan and log daily symptoms."
        )
    else:
        risk, score = 'low', 22
        msg = (
            f"LOW RISK ({score}/100): {len(injuries)} past injuries all recovered. "
            f"Watch for recurrence in previously injured areas."
        )

    risk_factors = []
    if severe:
        risk_factors.append(f'{severe} severe injury(ies) still active')
    if len(active) >= 2:
        risk_factors.append('Multiple simultaneous injuries increase overload risk')
    if body_parts:
        risk_factors.append(f'Loaded areas: {", ".join(body_parts)}')
    if athlete.status == 'Injured':
        risk_factors.append('Athlete status flagged as Injured in roster')
    if not risk_factors:
        risk_factors.append('Recovered history — monitor for overtraining')

    return {
        'risk_level': risk,
        'risk_score': score,
        'alert': risk in ('medium', 'high'),
        'message': msg,
        'active_injuries': len(active),
        'recent_injuries': len(injuries),
        'injury_history': injury_details,
        'prevention_tips': prevention_tips,
        'risk_factors': risk_factors,
    }


def generate_attendance_analysis(athlete):
    """60-day attendance patterns."""
    cutoff = date.today() - timedelta(days=60)
    records = list(athlete.attendance_records.filter(attendance_date__gte=cutoff))
    total = len(records)
    present = sum(1 for r in records if r.status == 'Present')
    late = sum(1 for r in records if r.status == 'Late')
    absent = sum(1 for r in records if r.status == 'Absent')
    rate = round((present / total * 100) if total > 0 else 0, 1)

    by_type = {}
    for r in records:
        by_type[r.session_type] = by_type.get(r.session_type, 0) + 1

    if rate >= 90:
        grade, insight = 'Excellent', 'Consistency is elite — correlates with 20%+ faster skill acquisition.'
    elif rate >= 75:
        grade, insight = 'Good', 'Solid attendance — target 90%+ for competition peak blocks.'
    elif rate >= 60:
        grade, insight = 'Fair', 'Gaps detected — missed sessions may slow recovery and technique progress.'
    else:
        grade, insight = 'Poor', 'Critical: low attendance undermines training adaptations and increases injury risk.'

    return {
        'rate_60d': rate,
        'grade': grade,
        'insight': insight,
        'sessions_total': total,
        'present': present,
        'late': late,
        'absent': absent,
        'by_session_type': by_type,
        'recommendation': (
            f"Attendance {rate}% ({grade}) over 60 days — {present} present, "
            f"{absent} absent, {late} late. {insight}"
        ),
    }


def generate_competition_intel(athlete):
    """Medals, recent results, competition readiness."""
    results = list(
        CompetitionResult.objects.filter(athlete=athlete)
        .select_related('competition')
        .order_by('-competition__competition_date')[:5]
    )
    medals = {'Gold': 0, 'Silver': 0, 'Bronze': 0}
    for r in results:
        if r.medal in medals:
            medals[r.medal] += 1

    recent = [{
        'event': r.competition.name,
        'date': r.competition.competition_date.isoformat(),
        'level': r.competition.level,
        'medal': r.medal,
        'position': r.position,
        'score': r.score,
    } for r in results]

    total_medals = sum(medals.values())
    if total_medals >= 3:
        comp_grade = 'Podium Contender'
    elif total_medals >= 1:
        comp_grade = 'Competitive'
    elif results:
        comp_grade = 'Developing'
    else:
        comp_grade = 'No competition data'

    return {
        'medals': medals,
        'total_medals': total_medals,
        'recent_results': recent,
        'competition_grade': comp_grade,
        'summary': (
            f"Competition profile: {comp_grade}. "
            f"{medals['Gold']} gold, {medals['Silver']} silver, {medals['Bronze']} bronze "
            f"across {len(results)} recorded events."
        ),
    }


def generate_weight_analysis(athlete):
    """Latest weight/BMI trend."""
    records = list(athlete.weight_records.order_by('-record_date')[:3])
    if not records:
        return {'available': False, 'message': 'No weight records — add data for body composition AI.'}

    latest = records[0]
    bmi = float(latest.bmi) if latest.bmi else None
    weight = float(latest.weight_kg)

    if bmi:
        if bmi < 18.5:
            category = 'Underweight'
            tip = 'Consider nutrition consult to support lean mass gains for your sport.'
        elif bmi < 25:
            category = 'Healthy range'
            tip = 'Body composition in healthy range — maintain with balanced macros.'
        elif bmi < 30:
            category = 'Overweight'
            tip = 'Monitor body fat %; prioritize lean protein and recovery nutrition.'
        else:
            category = 'High BMI'
            tip = 'Work with coach on load management and structured conditioning.'
    else:
        category, tip = 'Unknown', 'Log height with weight for BMI-based recommendations.'

    change = None
    if len(records) >= 2:
        change = round(weight - float(records[1].weight_kg), 1)

    return {
        'available': True,
        'weight_kg': weight,
        'bmi': bmi,
        'category': category,
        'body_fat': float(latest.body_fat_percentage) if latest.body_fat_percentage else None,
        'weight_change_kg': change,
        'tip': tip,
        'record_date': latest.record_date.isoformat(),
        'summary': (
            f"Latest: {weight} kg, BMI {bmi or 'N/A'} ({category}). "
            f"{f'Weight change: {change:+.1f} kg since prior entry. ' if change is not None else ''}"
            f"{tip}"
        ),
    }


def generate_readiness_analysis(athlete, perf, injury, attendance, progress):
    """Composite readiness score 0–100 with factor breakdown."""
    perf_score = min(100, progress.get('overall_average', 0))
    att_score = attendance.get('rate_60d', 0)
    injury_penalty = {'low': 0, 'medium': 18, 'high': 35}.get(injury.get('risk_level', 'low'), 0)
    injury_component = max(0, 100 - injury_penalty - injury.get('risk_score', 0) * 0.3)

    if perf.get('available'):
        trend_bonus = min(10, perf.get('improving_count', 0) * 2)
    else:
        trend_bonus = 0

    raw = (perf_score * 0.4) + (att_score * 0.25) + (injury_component * 0.25) + (trend_bonus + 50) * 0.1
    score = max(0, min(100, round(raw)))

    if score >= 85:
        status, verdict = 'Competition Ready', 'Clear to compete at full intensity with standard warm-up.'
    elif score >= 70:
        status, verdict = 'Train Smart', 'Train hard but cap peak sessions at 85% max effort.'
    elif score >= 55:
        status, verdict = 'Monitor Load', 'Reduce volume 15–20%; emphasize technique and recovery.'
    else:
        status, verdict = 'Recovery Focus', 'Prioritize rest, rehab, and medical check before intense work.'

    return {
        'score': score,
        'status': status,
        'verdict': verdict,
        'factors': {
            'performance': round(perf_score),
            'attendance': round(att_score),
            'injury_safety': round(injury_component),
            'momentum_bonus': trend_bonus,
        },
        'summary': (
            f"Readiness {score}% — {status}. {verdict} "
            f"Performance factor {round(perf_score)}, attendance {round(att_score)}%, "
            f"injury safety {round(injury_component)}."
        ),
    }


def generate_training_plan(athlete, perf, injury, readiness):
    """Weekly AI action plan — 6–8 specific items."""
    sport = athlete.sport or 'your sport'
    plan = []

    if readiness['score'] >= 80:
        plan.append(f"Peak week for {sport}: 2 high-intensity sessions + 1 competition simulation.")
    elif readiness['score'] >= 65:
        plan.append(f"Build week: progressive overload on {sport}-specific skills, 1 deload day.")
    else:
        plan.append('Recovery week: technique-only sessions, no max-effort loading.')

    if perf.get('available'):
        weak = perf.get('weakest_metric', 'flexibility')
        plan.append(f"Add 2× 20-min sessions targeting {weak} (AI weakest metric).")
        if perf.get('declining_count', 0) >= 2:
            plan.append('Review sleep and nutrition — multiple metrics declining simultaneously.')

    if injury.get('alert'):
        plan.append(f"Injury protocol: follow rehab for {injury['active_injuries']} active issue(s); log pain 1–10 daily.")
        plan.append('Substitute pool/cycle sessions for impact work if lower-body injury present.')
    else:
        plan.append('Prehab: 15-min activation (bands, hip mobility) before every main session.')

    plan.append('Log RPE (1–10) after each session in AthleteForge for next AI analysis.')
    plan.append('Sunday: review readiness score and adjust Monday session intensity.')
    plan.append(f"Sport focus ({sport}): maintain sport-specific drills 3×/week minimum.")

    return {
        'week_start': date.today().isoformat(),
        'items': plan,
        'priority': plan[0],
        'session_count_recommended': 4 if readiness['score'] >= 70 else 3,
    }


def generate_recovery_timeline(athlete, injury, readiness):
    """AI recovery phases with dates."""
    today = date.today()
    risk = injury.get('risk_level', 'low')

    if risk == 'high':
        return [
            {'phase': 'Immediate deload', 'status': 'active', 'detail': 'Stop max-effort work — active severe injury', 'eta_days': 0},
            {'phase': 'Medical assessment', 'status': 'future', 'detail': 'Physio/sports medicine clearance required', 'eta_days': 7},
            {'phase': 'Gradual return', 'status': 'future', 'detail': '50% → 70% → 85% load progression', 'eta_days': 14},
            {'phase': 'Full training', 'status': 'future', 'detail': f'Target when readiness exceeds 75% (now {readiness["score"]}%)', 'eta_days': 21},
        ]
    if risk == 'medium':
        return [
            {'phase': 'Modified training', 'status': 'active', 'detail': injury.get('message', '')[:100], 'eta_days': 0},
            {'phase': 'Rehab integration', 'status': 'future', 'detail': '3×/week targeted rehab alongside skill work', 'eta_days': 5},
            {'phase': 'Load normalization', 'status': 'future', 'detail': 'Return to standard periodization', 'eta_days': 10},
            {'phase': 'Competition block', 'status': 'future', 'detail': f'Projected at readiness 85%+', 'eta_days': 18},
        ]
    return [
        {'phase': 'Training block', 'status': 'done', 'detail': f'Low injury risk — {athlete.sport} program on track', 'eta_days': 0},
        {'phase': 'Performance push', 'status': 'active', 'detail': f'Readiness {readiness["score"]}% supports progressive overload', 'eta_days': 0},
        {'phase': 'Pre-competition taper', 'status': 'future', 'detail': 'Reduce volume 30% 5 days before event', 'eta_days': 12},
        {'phase': 'Competition day', 'status': 'future', 'detail': readiness.get('verdict', ''), 'eta_days': 18},
    ]


def generate_coaching_brief(athlete, perf, injury, attendance, progress, readiness, competition, weight, plan):
    """Long narrative for voice/copilot."""
    parts = [
        f"AthleteForge AI Brief for {athlete.full_name} ({athlete.sport}, {athlete.team or 'unassigned'}).",
        readiness['summary'],
        attendance['recommendation'],
    ]
    if perf.get('available'):
        parts.append(perf['recommendation'])
    parts.append(injury['message'])
    parts.append(competition['summary'])
    if weight.get('available'):
        parts.append(weight['summary'])
    parts.append(f"This week's priority: {plan['priority']}")
    parts.append(
        f"Overall grade {progress.get('performance_grade', 'N/A')} "
        f"at {progress.get('overall_average', 0)}/100 across {perf.get('sessions_analyzed', 0)} performance sessions."
    )
    return ' '.join(parts)


def generate_progress_summary(athlete):
    """Overall progress summary."""
    performances = athlete.performances.order_by('-record_date')[:6]
    avg_scores = performances.aggregate(
        speed=Avg('speed_score'), strength=Avg('strength_score'),
        endurance=Avg('endurance_score'), flexibility=Avg('flexibility_score'),
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

    attendance = generate_attendance_analysis(athlete)
    injury_alert = generate_injury_risk_alert(athlete)

    summary = (
        f"Performance grade: {performance_grade} (composite {overall_avg}/100). "
        f"Attendance: {attendance['rate_60d']}% — {attendance['grade']}. "
        f"Injury risk: {injury_alert['risk_level'].upper()} ({injury_alert['risk_score']}/100). "
        f"Sessions logged: {attendance['sessions_total']} in 60 days."
    )

    return {
        'overall_average': overall_avg,
        'performance_grade': performance_grade,
        'attendance_rate': attendance['rate_60d'],
        'sessions_recorded': attendance['sessions_total'],
        'summary': summary,
        'injury_risk': injury_alert['risk_level'],
        'metric_averages': {k: round(float(v), 1) if v else None for k, v in avg_scores.items()},
    }


def answer_copilot_question(insights, question):
    """Context-aware detailed answer from full insights bundle."""
    q = (question or '').lower().strip()
    athlete = insights.get('athlete_name', 'Athlete')
    readiness = insights.get('readiness_analysis', {})
    perf = insights.get('performance_insights', {})
    injury = insights.get('injury_risk', {})
    att = insights.get('attendance_analysis', {})
    comp = insights.get('competition_intel', {})
    weight = insights.get('weight_analysis', {})
    plan = insights.get('training_plan', {})
    brief = insights.get('coaching_brief', '')

    if any(w in q for w in ('readiness', 'ready', 'compete', 'competition ready')):
        return (
            f"{athlete} readiness: {readiness.get('score', '?')}% — {readiness.get('status', '')}. "
            f"{readiness.get('verdict', '')} "
            f"Breakdown — performance {readiness.get('factors', {}).get('performance', '?')}, "
            f"attendance {readiness.get('factors', {}).get('attendance', '?')}, "
            f"injury safety {readiness.get('factors', {}).get('injury_safety', '?')}."
        )

    if any(w in q for w in ('injur', 'risk', 'hurt', 'pain', 'rehab')):
        lines = [injury.get('message', '')]
        for factor in injury.get('risk_factors', [])[:3]:
            lines.append(f"• {factor}")
        for tip in injury.get('prevention_tips', [])[:2]:
            lines.append(f"Tip: {tip}")
        if injury.get('injury_history'):
            hist = injury['injury_history'][0]
            lines.append(
                f"Latest: {hist['type']} ({hist['body_part']}) — {hist['severity']}, {hist['status']}."
            )
        return ' '.join(lines)

    if any(w in q for w in ('perform', 'speed', 'strength', 'endurance', 'flex', 'agil', 'metric', 'trend')):
        if not perf.get('available'):
            return perf.get('message', 'Need more performance data.')
        lines = [perf.get('recommendation', '')]
        for m in perf.get('metrics', []):
            lines.append(
                f"{m['label']}: {m['current']} (was {m['previous']}, {m['change_percent']:+.1f}%) — {m['trend']}."
            )
        return ' '.join(lines)

    if any(w in q for w in ('attend', 'session', 'miss', 'present')):
        return (
            f"{att.get('recommendation', '')} "
            f"Breakdown: {att.get('present', 0)} present, {att.get('absent', 0)} absent, "
            f"{att.get('late', 0)} late out of {att.get('sessions_total', 0)} sessions."
        )

    if any(w in q for w in ('train', 'plan', 'workout', 'week', 'should i')):
        items = plan.get('items', [])
        return (
            f"Weekly plan for {athlete}: Priority — {plan.get('priority', '')} "
            + ' '.join(f"({i+1}) {item}" for i, item in enumerate(items[:5]))
        )

    if any(w in q for w in ('medal', 'competition', 'event', 'podium')):
        return comp.get('summary', 'No competition data yet.')

    if any(w in q for w in ('weight', 'bmi', 'body', 'fat')):
        return weight.get('summary', weight.get('message', 'No weight data logged.'))

    if any(w in q for w in ('summary', 'brief', 'overview', 'everything', 'full')):
        return brief[:900]

    return (
        f"{brief[:500]} "
        f"Ask me about: readiness, injuries, performance metrics, training plan, "
        f"attendance, competition results, or weight/BMI."
    )


def get_ai_insights_for_athlete(athlete):
    """Full AI intelligence bundle."""
    perf = generate_performance_insights(athlete)
    injury = generate_injury_risk_alert(athlete)
    progress = generate_progress_summary(athlete)
    attendance = generate_attendance_analysis(athlete)
    competition = generate_competition_intel(athlete)
    weight = generate_weight_analysis(athlete)
    readiness = generate_readiness_analysis(athlete, perf, injury, attendance, progress)
    plan = generate_training_plan(athlete, perf, injury, readiness)
    timeline = generate_recovery_timeline(athlete, injury, readiness)
    brief = generate_coaching_brief(
        athlete, perf, injury, attendance, progress, readiness, competition, weight, plan
    )

    action_items = [
        {'priority': 'high', 'text': plan['priority']},
        {'priority': 'high' if injury.get('alert') else 'medium', 'text': injury['message'][:120]},
    ]
    if perf.get('available'):
        action_items.append({
            'priority': 'medium',
            'text': f"Focus {perf['weakest_metric']} — {perf['metrics'][-1]['suggestion'] if perf.get('metrics') else 'extra sessions'}",
        })
    action_items.append({'priority': 'low', 'text': attendance['insight']})

    return {
        'athlete_id': athlete.id,
        'athlete_name': athlete.full_name,
        'athlete_sport': athlete.sport,
        'athlete_team': athlete.team,
        'generated_at': date.today().isoformat(),
        'readiness_analysis': readiness,
        'readiness_score': readiness['score'],
        'performance_insights': perf,
        'injury_risk': injury,
        'progress_summary': progress,
        'attendance_analysis': attendance,
        'competition_intel': competition,
        'weight_analysis': weight,
        'training_plan': plan,
        'recovery_timeline': timeline,
        'coaching_brief': brief,
        'action_items': action_items,
        'sport_tips': [
            f"{athlete.sport}-specific: prioritize energy system work matching event demands.",
            'Log session RPE within 30 minutes post-training for accurate AI load tracking.',
            'Review readiness every Monday; adjust weekly plan if score drops below 65%.',
        ],
    }


def get_demo_ai_insights():
    """Rich public demo when no DB athlete."""
    athlete = Athlete.objects.first()
    if athlete:
        payload = get_ai_insights_for_athlete(athlete)
        payload['demo_mode'] = True
        return payload

    return {
        'demo_mode': True,
        'athlete_name': 'Rahul Sharma',
        'athlete_sport': 'Track & Field',
        'readiness_score': 82,
        'readiness_analysis': {
            'score': 82, 'status': 'Train Smart',
            'verdict': 'Train hard but cap peak sessions at 85% max effort.',
            'factors': {'performance': 84, 'attendance': 94, 'injury_safety': 88, 'momentum_bonus': 6},
            'summary': 'Readiness 82% — Train Smart. Performance 84, attendance 94%, injury safety 88.',
        },
        'coaching_brief': (
            'AthleteForge AI Brief for Rahul Sharma (Track & Field). Readiness 82% — Train Smart. '
            'Attendance 94% (Excellent). Speed +12%, Strength +8%; focus Flexibility (-3%). '
            'Low injury risk. 2 gold medals. Priority: Build week with progressive overload.'
        ),
        'performance_insights': {
            'available': True,
            'headline': 'Speed leading at +12%',
            'recommendation': 'Top gain: Speed (+12%). Priority: Flexibility — add 2× weekly mobility work.',
            'metrics': [
                {'metric': 'speed', 'label': 'Speed', 'change_percent': 12, 'current': 88, 'previous': 78.5, 'trend': 'up', 'suggestion': 'sprint intervals'},
                {'metric': 'strength', 'label': 'Strength', 'change_percent': 8, 'current': 85, 'previous': 78.7, 'trend': 'up', 'suggestion': 'resistance training'},
                {'metric': 'endurance', 'label': 'Endurance', 'change_percent': 5, 'current': 80, 'previous': 76.2, 'trend': 'up', 'suggestion': 'cardio sessions'},
                {'metric': 'flexibility', 'label': 'Flexibility', 'change_percent': -3, 'current': 72, 'previous': 74.2, 'trend': 'down', 'suggestion': 'mobility work'},
                {'metric': 'agility', 'label': 'Agility', 'change_percent': 4, 'current': 79, 'previous': 76, 'trend': 'up', 'suggestion': 'ladder drills'},
            ],
            'sessions_analyzed': 6, 'improving_count': 4, 'declining_count': 1,
            'confidence': 'high',
        },
        'injury_risk': {
            'risk_level': 'low', 'risk_score': 15, 'alert': False,
            'message': 'LOW RISK (15/100): No active injuries. Continue preventive protocol.',
            'active_injuries': 0, 'recent_injuries': 1,
            'risk_factors': ['Recovered ankle sprain — monitor landing mechanics'],
            'prevention_tips': ['Dynamic warm-up 10 min', '48hr between max sprint sessions'],
            'injury_history': [{'type': 'Ankle Sprain', 'body_part': 'Ankle', 'severity': 'Minor', 'status': 'Recovered', 'date': '2025-11-01'}],
        },
        'progress_summary': {
            'overall_average': 84, 'performance_grade': 'Excellent',
            'attendance_rate': 94, 'sessions_recorded': 48,
            'summary': 'Performance grade: Excellent (84/100). Attendance 94%. Injury risk LOW.',
        },
        'attendance_analysis': {
            'rate_60d': 94, 'grade': 'Excellent', 'present': 45, 'absent': 2, 'late': 1,
            'sessions_total': 48,
            'recommendation': 'Attendance 94% (Excellent) — elite consistency.',
        },
        'training_plan': {
            'priority': 'Build week: progressive overload on speed-endurance',
            'items': [
                '2 high-intensity track sessions (Mon/Thu)',
                '2× 20-min flexibility sessions',
                '1 recovery swim or light jog',
                'Log RPE after every session',
            ],
        },
        'action_items': [
            {'priority': 'high', 'text': 'Build week: progressive overload on speed-endurance'},
            {'priority': 'medium', 'text': 'Add 2× mobility sessions for flexibility deficit'},
        ],
    }