from rest_framework import serializers

from .models import TrainingProgram, ProgramDay, ProgramBlock, ProgramExercise, ExerciseCompletion


class ProgramExerciseSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = ProgramExercise
        fields = [
            'id', 'block', 'name', 'sets', 'reps', 'load', 'rest_seconds',
            'tempo', 'notes', 'order', 'is_completed',
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
