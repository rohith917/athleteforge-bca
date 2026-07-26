from rest_framework import serializers

from .models import (
    TrainingProgram, ProgramDay, ProgramBlock, ProgramExercise, ExerciseCompletion,
    WellnessCheckIn, SessionRPE, TestProtocol, TestResult,
)


class ProgramExerciseSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = ProgramExercise
        fields = [
            'id', 'block', 'name', 'sets', 'reps', 'load', 'rest_seconds',
            'tempo', 'notes', 'order', 'is_completed',
            'image_url', 'video_url', 'has_3d_demo', 'model_3d_ref',
        ]
        extra_kwargs = {'block': {'required': False}}

    def get_is_completed(self, obj):
        athlete_id = self.context.get('athlete_id')
        if not athlete_id:
            return None
        completion = obj.completions.filter(athlete_id=athlete_id).first()
        return bool(completion and completion.is_completed)


class ProgramBlockSerializer(serializers.ModelSerializer):
    exercises = ProgramExerciseSerializer(many=True, read_only=True)
    block_type_display = serializers.CharField(source='get_block_type_display', read_only=True)

    class Meta:
        model = ProgramBlock
        fields = ['id', 'day', 'block_type', 'block_type_display', 'title', 'notes', 'order', 'exercises']
        extra_kwargs = {'day': {'required': False}}


class ProgramDaySerializer(serializers.ModelSerializer):
    blocks = serializers.SerializerMethodField()

    class Meta:
        model = ProgramDay
        fields = ['id', 'program', 'date', 'label', 'order', 'blocks']
        extra_kwargs = {'program': {'required': False}}

    def get_blocks(self, obj):
        return ProgramBlockSerializer(obj.blocks.all(), many=True, context=self.context).data


class TrainingProgramListSerializer(serializers.ModelSerializer):
    athlete_name = serializers.CharField(source='athlete.full_name', read_only=True)
    coach_name = serializers.SerializerMethodField()
    day_count = serializers.IntegerField(source='days.count', read_only=True)

    class Meta:
        model = TrainingProgram
        fields = [
            'id', 'name', 'athlete', 'athlete_name', 'coach', 'coach_name', 'sport',
            'status', 'start_date', 'end_date', 'notes', 'day_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['coach']

    def get_coach_name(self, obj):
        if not obj.coach:
            return None
        return f'{obj.coach.first_name} {obj.coach.last_name}'.strip() or obj.coach.username


class TrainingProgramDetailSerializer(TrainingProgramListSerializer):
    days = serializers.SerializerMethodField()

    class Meta(TrainingProgramListSerializer.Meta):
        fields = TrainingProgramListSerializer.Meta.fields + ['days']

    def get_days(self, obj):
        ctx = {**self.context, 'athlete_id': obj.athlete_id}
        return ProgramDaySerializer(obj.days.all(), many=True, context=ctx).data


class ExerciseCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseCompletion
        fields = [
            'id', 'exercise', 'athlete', 'is_completed', 'actual_sets',
            'actual_reps', 'actual_load', 'athlete_notes', 'completed_at',
        ]
        read_only_fields = ['athlete']


class WellnessCheckInSerializer(serializers.ModelSerializer):
    athlete_name = serializers.CharField(source='athlete.full_name', read_only=True)
    wellness_score = serializers.ReadOnlyField()

    class Meta:
        model = WellnessCheckIn
        fields = [
            'id', 'athlete', 'athlete_name', 'date', 'sleep_hours', 'sleep_quality',
            'fatigue', 'soreness', 'stress', 'mood', 'resting_heart_rate', 'notes',
            'wellness_score', 'created_at',
        ]
        read_only_fields = ['athlete']


class SessionRPESerializer(serializers.ModelSerializer):
    athlete_name = serializers.CharField(source='athlete.full_name', read_only=True)
    training_load = serializers.ReadOnlyField()

    class Meta:
        model = SessionRPE
        fields = [
            'id', 'athlete', 'athlete_name', 'session_date', 'rpe', 'duration_minutes',
            'session_type', 'notes', 'training_load', 'created_at',
        ]
        read_only_fields = ['athlete']


class TestProtocolSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = TestProtocol
        fields = [
            'id', 'name', 'slug', 'category', 'category_display', 'description',
            'unit', 'higher_is_better', 'is_active',
        ]


class TestResultSerializer(serializers.ModelSerializer):
    athlete_name = serializers.CharField(source='athlete.full_name', read_only=True)
    protocol_name = serializers.CharField(source='protocol.name', read_only=True)
    protocol_unit = serializers.CharField(source='protocol.unit', read_only=True)
    protocol_category = serializers.CharField(source='protocol.category', read_only=True)
    recorded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TestResult
        fields = [
            'id', 'athlete', 'athlete_name', 'protocol', 'protocol_name', 'protocol_unit',
            'protocol_category', 'test_date', 'value', 'recorded_by', 'recorded_by_name',
            'notes', 'created_at',
        ]
        read_only_fields = ['athlete', 'recorded_by']

    def get_recorded_by_name(self, obj):
        if not obj.recorded_by:
            return None
        return f'{obj.recorded_by.first_name} {obj.recorded_by.last_name}'.strip() or obj.recorded_by.username
