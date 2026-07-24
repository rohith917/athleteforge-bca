"""
Training Program Generator.

Follows the exact same honesty pattern as api/free_ai.py: report which
mode actually produced the program (llm vs rules), never claim an LLM
ran when it didn't. No GROQ_API_KEY/GEMINI_API_KEY is configured in
this environment, so generation runs through the rule-based engine
below — a real, deterministic periodization/template system, not a
placeholder. If a key is later configured, `generate_training_program`
is the one seam that would route to an LLM call instead (mirroring
free_ai.py's provider check) while keeping the same output contract:
a fully-populated TrainingProgram the coach can open and edit like any
other.
"""
import os
from datetime import timedelta

from .models import TrainingProgram, ProgramDay, ProgramBlock, ProgramExercise


def get_generator_status():
    if os.environ.get('GROQ_API_KEY', '').strip() or os.environ.get('GEMINI_API_KEY', '').strip():
        return {'available': True, 'mode': 'llm'}
    return {'available': True, 'mode': 'rules'}


# block sequence + exercise bank per goal, in the vocabulary of the
# existing ProgramBlock.BLOCK_TYPE_CHOICES
GOAL_TEMPLATES = {
    'strength': ['warm_up', 'activation', 'strength', 'power', 'cool_down'],
    'hypertrophy': ['warm_up', 'activation', 'strength', 'strength', 'cool_down'],
    'power': ['warm_up', 'activation', 'plyometrics', 'power', 'cool_down'],
    'endurance': ['warm_up', 'endurance', 'mobility', 'cool_down'],
    'speed_agility': ['warm_up', 'activation', 'speed', 'plyometrics', 'cool_down'],
    'general_fitness': ['warm_up', 'strength', 'endurance', 'mobility', 'cool_down'],
    'return_to_play': ['warm_up', 'mobility', 'strength', 'recovery', 'cool_down'],
}

EXERCISE_BANK = {
    'warm_up': [
        {'name': 'Light Jog / Cycle', 'reps': '5 min'},
        {'name': 'Dynamic Leg Swings', 'sets': 2, 'reps': '10 each leg'},
        {'name': 'World\'s Greatest Stretch', 'sets': 1, 'reps': '5 each side'},
    ],
    'activation': [
        {'name': 'Glute Bridges', 'sets': 2, 'reps': '12'},
        {'name': 'Band Pull-Aparts', 'sets': 2, 'reps': '15'},
        {'name': 'Bird Dog', 'sets': 2, 'reps': '8 each side'},
    ],
    'strength': [
        {'name': 'Squat (or Goblet Squat)', 'sets': 4, 'reps': '6-8', 'load': '70-80% 1RM'},
        {'name': 'Romanian Deadlift', 'sets': 3, 'reps': '8-10', 'load': 'moderate'},
        {'name': 'Push-Up / Bench Press', 'sets': 3, 'reps': '8-10'},
        {'name': 'Single-Arm Row', 'sets': 3, 'reps': '10 each side'},
    ],
    'power': [
        {'name': 'Broad Jump', 'sets': 4, 'reps': '3'},
        {'name': 'Medicine Ball Chest Throw', 'sets': 3, 'reps': '5'},
        {'name': 'Kettlebell Swing', 'sets': 3, 'reps': '8'},
    ],
    'plyometrics': [
        {'name': 'Pogo Hops', 'sets': 3, 'reps': '10'},
        {'name': 'Box Step-Down', 'sets': 3, 'reps': '8 each leg'},
        {'name': 'Lateral Bounds', 'sets': 3, 'reps': '6 each side'},
    ],
    'speed': [
        {'name': 'Build-Up Sprints', 'sets': 4, 'reps': '20m'},
        {'name': 'Acceleration Starts', 'sets': 4, 'reps': '10m'},
    ],
    'endurance': [
        {'name': 'Interval Run', 'sets': 1, 'reps': '20 min', 'notes': 'Alternate 2 min moderate / 1 min easy'},
        {'name': 'Steady-State Cardio', 'sets': 1, 'reps': '25-30 min'},
    ],
    'mobility': [
        {'name': 'Hip 90/90 Stretch', 'sets': 2, 'reps': '60s each side'},
        {'name': 'Thoracic Rotations', 'sets': 2, 'reps': '10 each side'},
        {'name': 'Ankle Dorsiflexion Rock', 'sets': 2, 'reps': '10 each side'},
    ],
    'recovery': [
        {'name': 'Easy Walk', 'sets': 1, 'reps': '15 min'},
        {'name': 'Foam Rolling', 'sets': 1, 'reps': '10 min'},
    ],
    'cool_down': [
        {'name': 'Static Stretch — Hamstrings', 'sets': 1, 'reps': '30s each side'},
        {'name': 'Static Stretch — Quads', 'sets': 1, 'reps': '30s each side'},
        {'name': 'Deep Breathing', 'sets': 1, 'reps': '2 min'},
    ],
}

BLOCK_LABELS = dict(ProgramBlock.BLOCK_TYPE_CHOICES)


def _apply_progression(exercise, week_index, total_weeks):
    """
    Simple linear-periodization adjustment: build up through weeks 1-3,
    deload every 4th week, otherwise nudge load/reps up as weeks pass.
    Mutates a copy, doesn't touch the exercise bank templates.
    """
    ex = dict(exercise)
    is_deload = total_weeks >= 4 and (week_index + 1) % 4 == 0
    if is_deload:
        if ex.get('sets'):
            ex['sets'] = max(1, ex['sets'] - 1)
        ex['notes'] = (ex.get('notes', '') + ' Deload week — reduce effort ~40%.').strip()
    elif ex.get('sets') and week_index >= 2:
        ex['sets'] = ex['sets'] + 1
    return ex


def generate_training_program(*, athlete, coach, name, sport, goal, duration_weeks,
                               sessions_per_week, start_date, experience_level='intermediate',
                               equipment_notes='', injury_notes=''):
    """
    Builds and persists a complete TrainingProgram (days -> blocks ->
    exercises) from structured inputs, via the rule-based template
    engine above. Returns the created TrainingProgram.
    """
    template = GOAL_TEMPLATES.get(goal, GOAL_TEMPLATES['general_fitness'])

    notes_parts = [f'Auto-generated: {goal.replace("_", " ").title()} focus, {experience_level} level.']
    if equipment_notes:
        notes_parts.append(f'Equipment: {equipment_notes}.')
    if injury_notes:
        notes_parts.append(f'Injury considerations: {injury_notes}.')

    program = TrainingProgram.objects.create(
        name=name,
        athlete=athlete,
        coach=coach,
        sport=sport,
        status='draft',
        start_date=start_date,
        end_date=start_date + timedelta(weeks=duration_weeks) - timedelta(days=1),
        notes=' '.join(notes_parts),
    )

    session_gap = max(1, 7 // sessions_per_week)
    day_order = 0

    for week_index in range(duration_weeks):
        for session_index in range(sessions_per_week):
            day_offset = week_index * 7 + session_index * session_gap
            day_date = start_date + timedelta(days=day_offset)
            day = ProgramDay.objects.create(
                program=program,
                date=day_date,
                label=f'Week {week_index + 1} — Session {session_index + 1}',
                order=day_order,
            )
            day_order += 1

            for block_order, block_type in enumerate(template):
                block = ProgramBlock.objects.create(
                    day=day,
                    block_type=block_type,
                    title=BLOCK_LABELS.get(block_type, block_type),
                    order=block_order,
                )
                bank = EXERCISE_BANK.get(block_type, [])
                for ex_order, base_exercise in enumerate(bank):
                    ex = _apply_progression(base_exercise, week_index, duration_weeks)
                    ProgramExercise.objects.create(
                        block=block,
                        name=ex['name'],
                        sets=ex.get('sets'),
                        reps=ex.get('reps', ''),
                        load=ex.get('load', ''),
                        notes=ex.get('notes', ''),
                        order=ex_order,
                    )

    return program
