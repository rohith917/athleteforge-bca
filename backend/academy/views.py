from datetime import timedelta

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.decorators import permission_classes as drf_permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response


from django.contrib.auth.models import Permission

from api.permissions import IsAdminOnly, IsCoachOrAdmin, is_staff_role

from .models import (
    Sport, CourseCategory, Course, CourseModule, Lesson, LessonFAQ, Quiz, QuizAttempt,
    Enrollment, LessonProgress, Certificate, Badge, UserBadge, LearningStreak,
    ResearchSummary, Organization, OrgRole, OrganizationMembership,
)
from .serializers import (
    SportSerializer, CourseCategorySerializer, CourseListSerializer, CourseDetailSerializer,
    CourseModuleWriteSerializer, LessonWriteSerializer, LessonFAQWriteSerializer, QuizWriteSerializer,
    LessonDetailSerializer, EnrollmentSerializer, CertificateSerializer,
    UserBadgeSerializer, LearningStreakSerializer, ResearchSummarySerializer,
    OrganizationSerializer, OrgRoleSerializer, OrganizationMembershipSerializer,
    PermissionSerializer, RBAC_PERMISSION_APPS,
)


class SportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Sport.objects.filter(is_active=True)
    serializer_class = SportSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    pagination_class = None


class CourseCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Unpaginated: this is bounded reference taxonomy (~180 top-level rows
    across 16 sports + general topics), not a growing per-user dataset —
    the default PAGE_SIZE=20 would otherwise silently truncate any
    unfiltered listing (e.g. a flattened category picker) to its first page.
    """

    queryset = CourseCategory.objects.filter(parent=None)
    serializer_class = CourseCategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        sport_slug = self.request.query_params.get('sport')
        if sport_slug:
            qs = qs.filter(sport__slug=sport_slug)
        elif self.request.query_params.get('general') == 'true':
            qs = qs.filter(sport=None)
        return qs


class CourseViewSet(viewsets.ModelViewSet):
    """
    Public read access to published courses; authoring restricted to coach/admin.
    Unpaginated for the same reason as CourseCategoryViewSet — the catalog
    is bounded (dozens of courses, not thousands) and several consumers
    (the catalog browser, the course builder) expect the full list.
    """

    serializer_class = CourseListSerializer
    lookup_field = 'slug'
    pagination_class = None

    def get_permissions(self):
        # NOTE: this previously fell through to IsCoachOrAdmin for every
        # action other than list/retrieve — including 'enroll', which
        # silently blocked every student from ever enrolling in a course
        # (403 on the enroll button, undetected until an actual student
        # login was tested end-to-end). The @action decorator's own
        # permission_classes=[IsAuthenticated] never took effect because
        # this get_permissions() override always wins.
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        if self.action == 'enroll':
            return [IsAuthenticated()]
        return [IsCoachOrAdmin()]

    def get_queryset(self):
        qs = Course.objects.select_related('category', 'category__sport').all()
        if not (self.request.user.is_authenticated and is_staff_role(self.request.user)):
            qs = qs.filter(status='published')
        category = self.request.query_params.get('category')
        sport = self.request.query_params.get('sport')
        level = self.request.query_params.get('level')
        search = self.request.query_params.get('search')
        if category:
            qs = qs.filter(category__slug=category)
        if sport:
            qs = qs.filter(category__sport__slug=sport)
        if level:
            qs = qs.filter(level=level)
        if search:
            qs = qs.filter(title__icontains=search)
        return qs

    def get_serializer_class(self):
        # CourseListSerializer omits 'description' (added only in the Detail
        # subclass) — using it for create/update would silently drop the
        # description a coach types in the builder, so writes get the Detail
        # serializer too, not just retrieve.
        if self.action in ('retrieve', 'create', 'update', 'partial_update'):
            return CourseDetailSerializer
        return CourseListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def enroll(self, request, slug=None):
        course = self.get_object()
        if course.status != 'published':
            return Response({'error': 'Course is not published yet.'}, status=status.HTTP_400_BAD_REQUEST)
        enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
        return Response(
            EnrollmentSerializer(enrollment, context={'request': request}).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class CourseModuleViewSet(viewsets.ModelViewSet):
    """Course-builder authoring: module CRUD, coach/admin only."""

    queryset = CourseModule.objects.all()
    serializer_class = CourseModuleWriteSerializer
    permission_classes = [IsCoachOrAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        course = self.request.query_params.get('course')
        if course:
            qs = qs.filter(course_id=course)
        return qs


class LessonFAQViewSet(viewsets.ModelViewSet):
    """Course-builder authoring: per-lesson FAQ CRUD, coach/admin only."""

    queryset = LessonFAQ.objects.all()
    serializer_class = LessonFAQWriteSerializer
    permission_classes = [IsCoachOrAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        lesson = self.request.query_params.get('lesson')
        if lesson:
            qs = qs.filter(lesson_id=lesson)
        return qs


class QuizViewSet(viewsets.ModelViewSet):
    """
    Course-builder authoring: create/edit a lesson's quiz (questions +
    choices) in one request. Coach/admin only — students never see
    is_correct through here, that stays on the read-only QuizSerializer
    nested in LessonDetailSerializer.
    """

    queryset = Quiz.objects.prefetch_related('questions__choices').all()
    serializer_class = QuizWriteSerializer
    permission_classes = [IsCoachOrAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        lesson = self.request.query_params.get('lesson')
        if lesson:
            qs = qs.filter(lesson_id=lesson)
        return qs


class LessonViewSet(viewsets.ModelViewSet):
    """Public read of published lessons; authoring restricted to coach/admin."""

    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsCoachOrAdmin()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return LessonWriteSerializer
        return LessonDetailSerializer

    def get_queryset(self):
        qs = Lesson.objects.select_related('module', 'module__course')
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return qs
        if self.request.user.is_authenticated and is_staff_role(self.request.user):
            return qs
        return qs.filter(is_published=True, module__course__status='published')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        lesson = self.get_object() if self.kwargs.get('slug') else None
        if lesson and self.request.user.is_authenticated:
            ctx['enrollment'] = Enrollment.objects.filter(
                user=self.request.user, course=lesson.module.course,
            ).first()
        return ctx

    @action(detail=True, methods=['post'])
    def complete(self, request, slug=None):
        lesson = self.get_object()
        enrollment = Enrollment.objects.filter(user=request.user, course=lesson.module.course).first()
        if not enrollment:
            return Response({'error': 'Enroll in this course first.'}, status=status.HTTP_400_BAD_REQUEST)

        progress, _ = LessonProgress.objects.get_or_create(enrollment=enrollment, lesson=lesson)
        if not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = timezone.now()
            progress.save()
            _update_streak(request.user)
            _maybe_award_first_lesson_badge(request.user)
            _maybe_complete_course(enrollment)

        return Response({
            'lesson_completed': True,
            'course_progress_percent': enrollment.progress_percent,
            'course_completed': enrollment.is_completed,
        })

    @action(detail=True, methods=['post'])
    def bookmark(self, request, slug=None):
        lesson = self.get_object()
        enrollment = Enrollment.objects.filter(user=request.user, course=lesson.module.course).first()
        if not enrollment:
            return Response({'error': 'Enroll in this course first.'}, status=status.HTTP_400_BAD_REQUEST)
        progress, _ = LessonProgress.objects.get_or_create(enrollment=enrollment, lesson=lesson)
        progress.is_bookmarked = not progress.is_bookmarked
        progress.save()
        return Response({'is_bookmarked': progress.is_bookmarked})

    @action(detail=True, methods=['post'])
    def submit_quiz(self, request, slug=None):
        lesson = self.get_object()
        quiz = get_object_or_404(Quiz, lesson=lesson)
        answers = request.data.get('answers', {})  # {question_id: choice_id}

        questions = quiz.questions.prefetch_related('choices')
        total = questions.count()
        correct = 0
        for q in questions:
            chosen_id = answers.get(str(q.id))
            if chosen_id and q.choices.filter(id=chosen_id, is_correct=True).exists():
                correct += 1

        score = round((correct / total * 100), 2) if total else 0
        passed = score >= quiz.passing_score_percent

        attempt = QuizAttempt.objects.create(
            quiz=quiz, user=request.user, score_percent=score, passed=passed, answers=answers,
        )

        if score == 100:
            _award_badge(request.user, 'quiz-ace')

        if passed:
            enrollment = Enrollment.objects.filter(user=request.user, course=lesson.module.course).first()
            if enrollment:
                progress, _ = LessonProgress.objects.get_or_create(enrollment=enrollment, lesson=lesson)
                if not progress.is_completed:
                    progress.is_completed = True
                    progress.completed_at = timezone.now()
                    progress.save()
                    _update_streak(request.user)
                    _maybe_award_first_lesson_badge(request.user)
                    _maybe_complete_course(enrollment)

        return Response({
            'score_percent': score,
            'passed': passed,
            'passing_score_percent': quiz.passing_score_percent,
            'attempt_id': attempt.id,
        })


def _update_streak(user):
    streak, _ = LearningStreak.objects.get_or_create(user=user)
    today = timezone.now().date()
    if streak.last_activity_date == today:
        return
    if streak.last_activity_date == today - timedelta(days=1):
        streak.current_streak_days += 1
    else:
        streak.current_streak_days = 1
    streak.longest_streak_days = max(streak.longest_streak_days, streak.current_streak_days)
    streak.last_activity_date = today
    streak.save()

    if streak.current_streak_days >= 7:
        _award_badge(user, 'consistent')
    if streak.current_streak_days >= 30:
        _award_badge(user, 'dedicated')


def _award_badge(user, slug):
    badge = Badge.objects.filter(slug=slug).first()
    if badge:
        UserBadge.objects.get_or_create(user=user, badge=badge)


def _maybe_award_first_lesson_badge(user):
    if LessonProgress.objects.filter(enrollment__user=user, is_completed=True).count() == 1:
        _award_badge(user, 'first-steps')


@transaction.atomic
def _maybe_complete_course(enrollment):
    total = enrollment.course.lesson_count
    if not total:
        return
    done = LessonProgress.objects.filter(enrollment=enrollment, is_completed=True).count()
    if done >= total and not enrollment.completed_at:
        enrollment.completed_at = timezone.now()
        enrollment.save()
        Certificate.objects.get_or_create(user=enrollment.user, course=enrollment.course)

        completed_count = Enrollment.objects.filter(user=enrollment.user, completed_at__isnull=False).count()
        if completed_count == 1:
            _award_badge(enrollment.user, 'course-complete')
        if completed_count == 5:
            _award_badge(enrollment.user, 'well-rounded')


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user).select_related('course', 'course__category')


class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user).select_related('course')


class MyBadgesViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserBadgeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user).select_related('badge')


class ResearchSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ResearchSummary.objects.select_related('topic').all()
    serializer_class = ResearchSummarySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        qs = super().get_queryset()
        topic = self.request.query_params.get('topic')
        if topic:
            qs = qs.filter(topic__slug=topic)
        return qs


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAdminOnly]


class OrgRoleViewSet(viewsets.ModelViewSet):
    queryset = OrgRole.objects.all()
    serializer_class = OrgRoleSerializer
    permission_classes = [IsAdminOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        org = self.request.query_params.get('organization')
        if org:
            qs = qs.filter(organization_id=org)
        return qs


@api_view(['GET'])
@drf_permission_classes([IsAdminOnly])
def available_permissions(request):
    """Assignable permissions for custom-role editing, scoped to this platform's own apps."""
    qs = (
        Permission.objects
        .filter(content_type__app_label__in=RBAC_PERMISSION_APPS)
        .select_related('content_type')
        .order_by('content_type__app_label', 'content_type__model', 'codename')
    )
    return Response(PermissionSerializer(qs, many=True).data)


class OrganizationMembershipViewSet(viewsets.ModelViewSet):
    queryset = OrganizationMembership.objects.select_related('user', 'organization', 'role').all()
    serializer_class = OrganizationMembershipSerializer
    permission_classes = [IsAdminOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        org = self.request.query_params.get('organization')
        if org:
            qs = qs.filter(organization_id=org)
        return qs


@api_view(['GET'])
@drf_permission_classes([IsAuthenticated])
def my_learning_summary(request):
    """Feeds the athlete dashboard's 'Continue Learning' + progress widgets."""
    enrollments = Enrollment.objects.filter(user=request.user).select_related('course')
    in_progress = [e for e in enrollments if not e.is_completed]
    streak, _ = LearningStreak.objects.get_or_create(user=request.user)

    continue_learning = None
    if in_progress:
        latest = max(in_progress, key=lambda e: e.last_accessed_at)
        continue_learning = EnrollmentSerializer(latest).data

    return Response({
        'continue_learning': continue_learning,
        'courses_enrolled': enrollments.count(),
        'courses_completed': sum(1 for e in enrollments if e.is_completed),
        'certificates_earned': Certificate.objects.filter(user=request.user).count(),
        'streak': LearningStreakSerializer(streak).data,
    })
