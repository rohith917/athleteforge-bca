from datetime import date

from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Athlete
from api.permissions import IsCoachOrAdmin, is_staff_role, get_athlete_for_user

from .generator import GOAL_TEMPLATES, generate_training_program, get_generator_status
from .models import (
    TrainingProgram, ProgramDay, ProgramBlock, ProgramExercise, ExerciseCompletion,
    WellnessCheckIn, SessionRPE, TestProtocol, TestResult,
)
from .serializers import (
    TrainingProgramListSerializer, TrainingProgramDetailSerializer,
    ProgramDaySerializer, ProgramBlockSerializer, ProgramExerciseSerializer,
    WellnessCheckInSerializer, SessionRPESerializer,
    TestProtocolSerializer, TestResultSerializer,
)


class TrainingProgramViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy', 'add_day', 'generate'):
            return [IsCoachOrAdmin()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ('retrieve', 'generate'):
            return TrainingProgramDetailSerializer
        return TrainingProgramListSerializer

    def get_queryset(self):
        qs = TrainingProgram.objects.select_related('athlete', 'coach').all()
        user = self.request.user
        if not is_staff_role(user):
            athlete = get_athlete_for_user(user)
            qs = qs.filter(athlete=athlete) if athlete else qs.none()
        athlete_id = self.request.query_params.get('athlete_id')
        if athlete_id:
            qs = qs.filter(athlete_id=athlete_id)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        serializer.save(coach=self.request.user)

    @action(detail=True, methods=['post'])
    def add_day(self, request, pk=None):
        program = self.get_object()
        serializer = ProgramDaySerializer(data={**request.data, 'program': program.id})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Builds a complete draft program (days -> blocks -> exercises) from
        structured inputs via the rule-based generator in generator.py
        (or an LLM if GROQ_API_KEY/GEMINI_API_KEY is ever configured —
        same seam api/free_ai.py uses for AI insights). Returns the full
        program, ready to open directly in the builder for review/edits.
        """
        data = request.data
        required = ['athlete', 'sport', 'goal', 'duration_weeks', 'sessions_per_week', 'start_date']
        missing = [f for f in required if not data.get(f)]
        if missing:
            return Response({'error': f'Missing required fields: {", ".join(missing)}'}, status=400)

        athlete = Athlete.objects.filter(id=data['athlete']).first()
        if not athlete:
            return Response({'error': 'Athlete not found.'}, status=404)

        if data['goal'] not in GOAL_TEMPLATES:
            return Response({'error': f'Unknown goal. Choose one of: {", ".join(GOAL_TEMPLATES)}'}, status=400)

        try:
            start_date = date.fromisoformat(data['start_date'])
        except (TypeError, ValueError):
            return Response({'error': 'start_date must be an ISO date (YYYY-MM-DD).'}, status=400)

        program = generate_training_program(
            athlete=athlete,
            coach=request.user,
            name=data.get('name') or f'{data["goal"].replace("_", " ").title()} Program — {athlete.full_name}',
            sport=data['sport'],
            goal=data['goal'],
            duration_weeks=int(data['duration_weeks']),
            sessions_per_week=int(data['sessions_per_week']),
            start_date=start_date,
            experience_level=data.get('experience_level', 'intermediate'),
            equipment_notes=data.get('equipment_notes', ''),
            injury_notes=data.get('injury_notes', ''),
        )

        serializer = self.get_serializer(program)
        response_data = serializer.data
        response_data['generator_mode'] = get_generator_status()['mode']
        return Response(response_data, status=201)


class ProgramDayViewSet(viewsets.ModelViewSet):
    serializer_class = ProgramDaySerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsCoachOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = ProgramDay.objects.select_related('program').all()
        user = self.request.user
        if not is_staff_role(user):
            athlete = get_athlete_for_user(user)
            qs = qs.filter(program__athlete=athlete) if athlete else qs.none()
        program_id = self.request.query_params.get('program')
        if program_id:
            qs = qs.filter(program_id=program_id)
        return qs


class ProgramBlockViewSet(viewsets.ModelViewSet):
    serializer_class = ProgramBlockSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy', 'reorder'):
            return [IsCoachOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = ProgramBlock.objects.select_related('day__program').all()
        user = self.request.user
        if not is_staff_role(user):
            athlete = get_athlete_for_user(user)
            qs = qs.filter(day__program__athlete=athlete) if athlete else qs.none()
        day_id = self.request.query_params.get('day')
        if day_id:
            qs = qs.filter(day_id=day_id)
        return qs

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Body: {order: [blockId, blockId, ...]} — the drag-and-drop drop handler."""
        order_list = request.data.get('order', [])
        for index, block_id in enumerate(order_list):
            ProgramBlock.objects.filter(id=block_id).update(order=index)
        return Response({'reordered': len(order_list)})


class ProgramExerciseViewSet(viewsets.ModelViewSet):
    serializer_class = ProgramExerciseSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy', 'reorder'):
            return [IsCoachOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = ProgramExercise.objects.select_related('block__day__program').all()
        user = self.request.user
        if not is_staff_role(user):
            athlete = get_athlete_for_user(user)
            qs = qs.filter(block__day__program__athlete=athlete) if athlete else qs.none()
        block_id = self.request.query_params.get('block')
        if block_id:
            qs = qs.filter(block_id=block_id)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        user = self.request.user
        if user.is_authenticated and not is_staff_role(user):
            athlete = get_athlete_for_user(user)
            if athlete:
                ctx['athlete_id'] = athlete.id
        return ctx

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Body: {order: [exerciseId, exerciseId, ...]} — the drag-and-drop drop handler."""
        order_list = request.data.get('order', [])
        for index, exercise_id in enumerate(order_list):
            ProgramExercise.objects.filter(id=exercise_id).update(order=index)
        return Response({'reordered': len(order_list)})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Athlete ticks an exercise off (or un-ticks it) for their own program."""
        exercise = self.get_object()
        user = request.user
        athlete = get_athlete_for_user(user) if not is_staff_role(user) else None
        if not athlete:
            athlete_id = request.data.get('athlete')
            athlete = Athlete.objects.filter(id=athlete_id).first()
        if not athlete:
            return Response({'error': 'No athlete context for this completion.'}, status=400)

        completion, _ = ExerciseCompletion.objects.get_or_create(exercise=exercise, athlete=athlete)
        completion.is_completed = not completion.is_completed
        completion.completed_at = timezone.now() if completion.is_completed else None
        for field in ('actual_sets', 'actual_reps', 'actual_load', 'athlete_notes'):
            if field in request.data:
                setattr(completion, field, request.data[field])
        completion.save()
        return Response({'is_completed': completion.is_completed})


class WellnessCheckInViewSet(viewsets.ModelViewSet):
    serializer_class = WellnessCheckInSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = WellnessCheckIn.objects.select_related('athlete').all()
        user = self.request.user
        if not is_staff_role(user):
            athlete = get_athlete_for_user(user)
            qs = qs.filter(athlete=athlete) if athlete else qs.none()
        athlete_id = self.request.query_params.get('athlete_id')
        if athlete_id:
            qs = qs.filter(athlete_id=athlete_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if is_staff_role(user):
            athlete = Athlete.objects.filter(id=self.request.data.get('athlete')).first()
        else:
            athlete = get_athlete_for_user(user)
        serializer.save(athlete=athlete)


class SessionRPEViewSet(viewsets.ModelViewSet):
    serializer_class = SessionRPESerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = SessionRPE.objects.select_related('athlete').all()
        user = self.request.user
        if not is_staff_role(user):
            athlete = get_athlete_for_user(user)
            qs = qs.filter(athlete=athlete) if athlete else qs.none()
        athlete_id = self.request.query_params.get('athlete_id')
        if athlete_id:
            qs = qs.filter(athlete_id=athlete_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if is_staff_role(user):
            athlete = Athlete.objects.filter(id=self.request.data.get('athlete')).first()
        else:
            athlete = get_athlete_for_user(user)
        serializer.save(athlete=athlete)


class TestProtocolViewSet(viewsets.ReadOnlyModelViewSet):
    """Standardized test definitions — read-only, bounded reference data."""

    queryset = TestProtocol.objects.filter(is_active=True)
    serializer_class = TestProtocolSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    lookup_field = 'slug'


class TestResultViewSet(viewsets.ModelViewSet):
    serializer_class = TestResultSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsCoachOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = TestResult.objects.select_related('athlete', 'protocol', 'recorded_by').all()
        user = self.request.user
        if not is_staff_role(user):
            athlete = get_athlete_for_user(user)
            qs = qs.filter(athlete=athlete) if athlete else qs.none()
        athlete_id = self.request.query_params.get('athlete_id')
        if athlete_id:
            qs = qs.filter(athlete_id=athlete_id)
        protocol_id = self.request.query_params.get('protocol_id')
        if protocol_id:
            qs = qs.filter(protocol_id=protocol_id)
        return qs

    def perform_create(self, serializer):
        athlete = Athlete.objects.filter(id=self.request.data.get('athlete')).first()
        serializer.save(athlete=athlete, recorded_by=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generator_status(request):
    """Which mode the Training Program Generator will run in — mirrors api/ai_status."""
    status_info = get_generator_status()
    return Response({
        **status_info,
        'label': 'AI-Assisted' if status_info['mode'] == 'llm' else 'Rule-Based Engine',
        'goals': list(GOAL_TEMPLATES.keys()),
    })
