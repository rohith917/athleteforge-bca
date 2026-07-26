from django.contrib.auth.models import Permission
from rest_framework import serializers

from .models import (
    Sport, CourseCategory, Course, CourseModule, Lesson, LessonFAQ,
    LessonAttachment, Assignment, AssignmentSubmission,
    Quiz, QuizQuestion, QuizChoice, QuizAttempt,
    Enrollment, LessonProgress, Certificate, Badge, UserBadge,
    LearningStreak, ResearchSummary, Organization, OrgRole, OrganizationMembership,
)


class SportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sport
        fields = ['id', 'name', 'slug', 'description', 'icon']


class CourseCategorySerializer(serializers.ModelSerializer):
    course_count = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()
    sport_name = serializers.CharField(source='sport.name', read_only=True)

    class Meta:
        model = CourseCategory
        fields = ['id', 'name', 'slug', 'description', 'parent', 'sport', 'sport_name', 'order', 'course_count', 'children']

    def get_course_count(self, obj):
        return obj.courses.filter(status='published').count()

    def get_children(self, obj):
        return CourseCategorySerializer(obj.children.all(), many=True, context=self.context).data


class LessonFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonFAQ
        fields = ['id', 'question', 'answer', 'order']


class LessonAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonAttachment
        fields = ['id', 'title', 'file', 'created_at']


class QuizChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizChoice
        fields = ['id', 'choice_text', 'order']  # is_correct intentionally excluded


class QuizQuestionSerializer(serializers.ModelSerializer):
    choices = QuizChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'order', 'choices']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'passing_score_percent', 'questions']


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'instructions', 'submission_type']


class LessonBriefSerializer(serializers.ModelSerializer):
    """Used inside a course's module list — no heavy content fields."""
    is_completed = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'slug', 'lesson_type', 'order', 'estimated_minutes',
            'has_3d_demo', 'is_published', 'is_completed', 'has_quiz',
        ]

    def get_is_completed(self, obj):
        enrollment = self.context.get('enrollment')
        if not enrollment:
            return False
        return LessonProgress.objects.filter(enrollment=enrollment, lesson=obj, is_completed=True).exists()

    def get_has_quiz(self, obj):
        return hasattr(obj, 'quiz')


class LessonDetailSerializer(serializers.ModelSerializer):
    faqs = LessonFAQSerializer(many=True, read_only=True)
    attachments = LessonAttachmentSerializer(many=True, read_only=True)
    quiz = QuizSerializer(read_only=True)
    assignment = AssignmentSerializer(read_only=True)
    course_id = serializers.IntegerField(source='module.course_id', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)
    module_title = serializers.CharField(source='module.title', read_only=True)
    is_completed = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'slug', 'lesson_type', 'order', 'estimated_minutes',
            'learning_objectives', 'content', 'scientific_explanation', 'practical_application',
            'key_coaching_points', 'common_mistakes', 'safety_considerations',
            'progressions', 'regressions', 'summary', 'references',
            'video_url', 'pdf_url', 'has_3d_demo', 'model_3d_ref',
            'faqs', 'attachments', 'quiz', 'assignment',
            'course_id', 'course_title', 'module_title',
            'is_completed', 'is_bookmarked',
        ]

    def _progress(self, obj):
        enrollment = self.context.get('enrollment')
        if not enrollment:
            return None
        return LessonProgress.objects.filter(enrollment=enrollment, lesson=obj).first()

    def get_is_completed(self, obj):
        progress = self._progress(obj)
        return bool(progress and progress.is_completed)

    def get_is_bookmarked(self, obj):
        progress = self._progress(obj)
        return bool(progress and progress.is_bookmarked)


class CourseModuleSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = CourseModule
        fields = ['id', 'title', 'description', 'order', 'lessons']

    def get_lessons(self, obj):
        return LessonBriefSerializer(obj.lessons.all(), many=True, context=self.context).data


class CourseModuleWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseModule
        fields = ['id', 'course', 'title', 'description', 'order']


class LessonWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            'id', 'module', 'title', 'lesson_type', 'order', 'estimated_minutes',
            'learning_objectives', 'content', 'scientific_explanation', 'practical_application',
            'key_coaching_points', 'common_mistakes', 'safety_considerations',
            'progressions', 'regressions', 'summary', 'references',
            'video_url', 'pdf_url', 'has_3d_demo', 'model_3d_ref', 'is_published',
        ]


class LessonFAQWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonFAQ
        fields = ['id', 'lesson', 'question', 'answer', 'order']


class QuizChoiceWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizChoice
        fields = ['id', 'choice_text', 'is_correct', 'order']


class QuizQuestionWriteSerializer(serializers.ModelSerializer):
    choices = QuizChoiceWriteSerializer(many=True)

    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'explanation', 'order', 'choices']


class QuizWriteSerializer(serializers.ModelSerializer):
    """
    Coach-facing quiz authoring. Questions/choices are always replaced
    wholesale on save (delete-and-recreate) rather than diffed — the
    builder UI always submits the full quiz, matching the same
    replace-not-merge semantics used for OrgRole permission editing.
    """
    questions = QuizQuestionWriteSerializer(many=True, required=False)

    class Meta:
        model = Quiz
        fields = ['id', 'lesson', 'title', 'passing_score_percent', 'questions']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        quiz = Quiz.objects.create(**validated_data)
        self._sync_questions(quiz, questions_data)
        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if questions_data is not None:
            instance.questions.all().delete()
            self._sync_questions(instance, questions_data)
        return instance

    def _sync_questions(self, quiz, questions_data):
        for q_order, q in enumerate(questions_data):
            choices_data = q.pop('choices', [])
            question = QuizQuestion.objects.create(
                quiz=quiz, order=q.get('order', q_order),
                question_text=q['question_text'], explanation=q.get('explanation', ''),
            )
            for c_order, c in enumerate(choices_data):
                QuizChoice.objects.create(
                    question=question, choice_text=c['choice_text'],
                    is_correct=c.get('is_correct', False), order=c.get('order', c_order),
                )


class CourseListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    sport_name = serializers.CharField(source='category.sport.name', read_only=True)
    lesson_count = serializers.IntegerField(read_only=True)
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'subtitle', 'category', 'category_name', 'sport_name',
            'level', 'status', 'cover_image', 'estimated_hours', 'lesson_count',
            'is_enrolled', 'created_at', 'published_at',
        ]

    def get_is_enrolled(self, obj):
        user = self.context.get('request') and self.context['request'].user
        if not user or not user.is_authenticated:
            return False
        return Enrollment.objects.filter(user=user, course=obj).exists()


class CourseDetailSerializer(CourseListSerializer):
    modules = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()

    class Meta(CourseListSerializer.Meta):
        fields = CourseListSerializer.Meta.fields + ['description', 'modules', 'progress_percent']

    def get_modules(self, obj):
        request = self.context.get('request')
        enrollment = None
        if request and request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(user=request.user, course=obj).first()
        ctx = {**self.context, 'enrollment': enrollment}
        return CourseModuleSerializer(obj.modules.all(), many=True, context=ctx).data

    def get_progress_percent(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        enrollment = Enrollment.objects.filter(user=request.user, course=obj).first()
        return enrollment.progress_percent if enrollment else None


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    progress_percent = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'enrolled_at', 'completed_at', 'last_accessed_at', 'progress_percent', 'is_completed']


class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_level = serializers.CharField(source='course.level', read_only=True)
    course_hours = serializers.DecimalField(source='course.estimated_hours', max_digits=5, decimal_places=1, read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'id', 'certificate_number', 'course', 'course_title', 'course_level',
            'course_hours', 'user_name', 'issued_at',
        ]

    def get_user_name(self, obj):
        return f'{obj.user.first_name} {obj.user.last_name}'.strip() or obj.user.username


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'slug', 'description', 'icon']


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'awarded_at']


class LearningStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningStreak
        fields = ['current_streak_days', 'longest_streak_days', 'last_activity_date']


class ResearchSummarySerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)

    class Meta:
        model = ResearchSummary
        fields = ['id', 'title', 'slug', 'topic', 'topic_name', 'summary', 'practical_takeaways', 'last_reviewed']


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'org_type', 'parent_organization', 'logo', 'is_active', 'created_at']


RBAC_PERMISSION_APPS = ['academy', 'training', 'api']


class PermissionSerializer(serializers.ModelSerializer):
    app_label = serializers.CharField(source='content_type.app_label', read_only=True)
    model = serializers.CharField(source='content_type.model', read_only=True)

    class Meta:
        model = Permission
        fields = ['id', 'codename', 'name', 'app_label', 'model']


class OrgRoleSerializer(serializers.ModelSerializer):
    permission_count = serializers.SerializerMethodField()
    permissions_detail = PermissionSerializer(source='permissions', many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        source='permissions', many=True, write_only=True, required=False,
        queryset=Permission.objects.filter(content_type__app_label__in=RBAC_PERMISSION_APPS),
    )

    class Meta:
        model = OrgRole
        fields = [
            'id', 'organization', 'name', 'slug', 'description', 'is_system',
            'permission_count', 'permissions_detail', 'permission_ids',
        ]
        extra_kwargs = {
            'slug': {'required': False},
            'is_system': {'read_only': True},
        }

    def get_permission_count(self, obj):
        return obj.permissions.count()

    def to_internal_value(self, data):
        # The (organization, slug) UniqueConstraint makes DRF auto-attach a
        # UniqueTogetherValidator that forces 'slug' to be required in the
        # input regardless of extra_kwargs — fill it in from 'name' first.
        if hasattr(data, 'copy'):
            data = data.copy()
        if not data.get('slug') and data.get('name'):
            from django.utils.text import slugify
            data['slug'] = slugify(data['name'])
        return super().to_internal_value(data)


class OrganizationMembershipSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationMembership
        fields = [
            'id', 'user', 'user_name', 'organization', 'organization_name',
            'role', 'role_name', 'is_primary', 'is_active', 'joined_at',
        ]

    def get_user_name(self, obj):
        return f'{obj.user.first_name} {obj.user.last_name}'.strip() or obj.user.username
