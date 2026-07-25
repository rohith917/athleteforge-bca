"""
AthleteForge Academy — multi-org RBAC and the Sports Science LMS.

Kept in its own app, additive to `api`: nothing here touches the existing
Athlete/Performance/Injury models, and the existing UserProfile.role field
(admin/coach/student) keeps working unchanged. This app layers a richer,
per-organization role/permission system and the course platform on top.
"""
import secrets

from django.contrib.auth.models import Permission, User
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


# ==================== Organizations & RBAC ====================

class Organization(models.Model):
    """A tenant: an academy, club, university program, or federation."""

    ORG_TYPE_CHOICES = [
        ('academy', 'Academy'),
        ('club', 'Club'),
        ('university', 'University'),
        ('federation', 'Federation'),
        ('independent', 'Independent Coach'),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    org_type = models.CharField(max_length=20, choices=ORG_TYPE_CHOICES, default='academy')
    parent_organization = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='sub_organizations',
        help_text='For regional associations under a federation, or franchise academies under a parent brand.',
    )
    logo = models.ImageField(upload_to='org_logos/', blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'academy_organizations'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class OrgRole(models.Model):
    """
    A named role, either a platform-wide system role (organization=None,
    is_system=True — seeded once via migration and shared by every org) or
    a custom role an organization admin defines for itself.

    Fine-grained access is delegated to Django's own Permission model
    (auto-created per model as add/change/delete/view, plus any custom
    `Meta.permissions` declared on a model) rather than reinventing a
    permission registry — new permissions from new models/features become
    available to roles automatically.
    """

    SYSTEM_ROLE_SLUGS = [
        'super_admin', 'org_admin', 'head_coach', 'assistant_coach',
        'strength_conditioning_coach', 'physiotherapist', 'nutritionist',
        'sports_psychologist', 'athlete', 'parent', 'referee',
        'event_organizer', 'sports_scientist', 'guest',
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, null=True, blank=True, related_name='custom_roles',
        help_text='Null for platform-wide system roles.',
    )
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120)
    description = models.TextField(blank=True, default='')
    is_system = models.BooleanField(default=False)
    permissions = models.ManyToManyField(Permission, blank=True, related_name='org_roles')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'academy_org_roles'
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(fields=['organization', 'slug'], name='unique_role_slug_per_org'),
        ]

    def __str__(self):
        scope = 'system' if self.is_system else (self.organization.name if self.organization else 'unscoped')
        return f'{self.name} ({scope})'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class OrganizationMembership(models.Model):
    """Links a user to an organization with a specific role in that org.

    A user can hold multiple memberships (coaches working across
    organizations, athletes belonging to multiple teams) — one row per
    (user, organization) pair, each carrying its own role.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='org_memberships')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='memberships')
    role = models.ForeignKey(OrgRole, on_delete=models.PROTECT, related_name='memberships')
    is_primary = models.BooleanField(default=False, help_text="This org drives the user's default dashboard.")
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'academy_org_memberships'
        constraints = [
            models.UniqueConstraint(fields=['user', 'organization'], name='unique_membership_per_org'),
        ]
        ordering = ['-is_primary', '-joined_at']

    def __str__(self):
        return f'{self.user.username} @ {self.organization.name} ({self.role.name})'


class ParentAthleteLink(models.Model):
    """Grants a Parent-role user read-only visibility into one athlete's record."""

    RELATIONSHIP_CHOICES = [
        ('mother', 'Mother'), ('father', 'Father'), ('guardian', 'Guardian'), ('other', 'Other'),
    ]

    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parent_links')
    athlete = models.ForeignKey('api.Athlete', on_delete=models.CASCADE, related_name='parent_links')
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES, default='guardian')
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'academy_parent_links'
        constraints = [
            models.UniqueConstraint(fields=['parent', 'athlete'], name='unique_parent_athlete_link'),
        ]

    def __str__(self):
        return f'{self.parent.username} -> {self.athlete.full_name}'


# ==================== Sports & Course Taxonomy ====================

class Sport(models.Model):
    """A sport with its own dedicated learning pathway (Taekwondo, Football, ...)."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=50, blank=True, default='', help_text='lucide-react icon name')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'academy_sports'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class CourseCategory(models.Model):
    """
    Course taxonomy as data, not a hardcoded enum — new categories (or new
    sports) can be added from the admin without a migration or touching
    application code.
    """

    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=170, blank=True)
    description = models.TextField(blank=True, default='')
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    sport = models.ForeignKey(
        Sport, on_delete=models.CASCADE, null=True, blank=True, related_name='categories',
        help_text='Set for sport-specific pathways; blank for general sports-science categories.',
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'academy_course_categories'
        ordering = ['order', 'name']
        verbose_name_plural = 'course categories'
        constraints = [
            # Scoped, not global: different sports (or a sport vs. the
            # general taxonomy) can legitimately reuse a slug like "testing".
            models.UniqueConstraint(fields=['sport', 'parent', 'slug'], name='unique_category_slug_scope'),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# ==================== Courses & Lessons ====================

class Course(models.Model):
    """A complete course: metadata + ordered modules + lessons."""

    LEVEL_CHOICES = [
        ('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'), ('published', 'Published'), ('archived', 'Archived'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    subtitle = models.CharField(max_length=300, blank=True, default='')
    description = models.TextField(blank=True, default='')
    category = models.ForeignKey(CourseCategory, on_delete=models.PROTECT, related_name='courses')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    cover_image = models.ImageField(upload_to='courses/covers/', blank=True, default='')
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, null=True, blank=True, related_name='courses',
        help_text='Null for platform-wide courses available to every organization.',
    )
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='authored_courses')
    version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'academy_courses'
        ordering = ['category__order', 'title']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    @property
    def lesson_count(self):
        return Lesson.objects.filter(module__course=self).count()


class CourseVersion(models.Model):
    """Snapshot of a course's structure at publish time, for edit history."""

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='versions')
    version = models.PositiveIntegerField()
    snapshot = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'academy_course_versions'
        ordering = ['-version']
        constraints = [
            models.UniqueConstraint(fields=['course', 'version'], name='unique_course_version'),
        ]

    def __str__(self):
        return f'{self.course.title} v{self.version}'


class CourseModule(models.Model):
    """An ordered section within a course (e.g. 'Warm-Up Systems')."""

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'academy_course_modules'
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.course.title} — {self.title}'


class Lesson(models.Model):
    """
    A single lesson. Every field the spec requires per-lesson (objectives,
    scientific explanation, coaching points, common mistakes, safety notes,
    summary, references, ...) is a first-class column so the course player
    can render a consistent structure for any lesson type.
    """

    LESSON_TYPE_CHOICES = [
        ('video', 'Video Lesson'), ('text', 'Text Lesson'), ('pdf', 'PDF Lesson'),
        ('presentation', 'Presentation'), ('exercise_demo', 'Exercise Demonstration'),
        ('assignment', 'Assignment'), ('practical_assessment', 'Practical Assessment'),
    ]

    module = models.ForeignKey(CourseModule, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, blank=True)
    lesson_type = models.CharField(max_length=30, choices=LESSON_TYPE_CHOICES, default='text')
    order = models.PositiveIntegerField(default=0)
    estimated_minutes = models.PositiveIntegerField(default=10)

    learning_objectives = models.TextField(blank=True, default='')
    content = models.TextField(blank=True, default='', help_text='Markdown body for text lessons.')
    scientific_explanation = models.TextField(blank=True, default='')
    practical_application = models.TextField(blank=True, default='')
    key_coaching_points = models.TextField(blank=True, default='')
    common_mistakes = models.TextField(blank=True, default='')
    safety_considerations = models.TextField(blank=True, default='')
    progressions = models.TextField(blank=True, default='')
    regressions = models.TextField(blank=True, default='')
    summary = models.TextField(blank=True, default='')
    references = models.TextField(blank=True, default='', help_text='Plain-text source list, no fabricated citations.')

    video_url = models.URLField(blank=True, default='')
    pdf_url = models.URLField(blank=True, default='')
    has_3d_demo = models.BooleanField(default=False, help_text='Flags that a 3D model/animation is attached (asset pipeline is a later phase).')
    model_3d_ref = models.CharField(max_length=200, blank=True, default='', help_text='Identifier the 3D viewer resolves once that pipeline exists.')

    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'academy_lessons'
        ordering = ['order', 'id']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class LessonFAQ(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='faqs')
    question = models.CharField(max_length=300)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'academy_lesson_faqs'
        ordering = ['order', 'id']

    def __str__(self):
        return self.question


class LessonAttachment(models.Model):
    """Downloadable resource attached to a lesson (worksheet, program sheet, etc.)."""

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='attachments')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='academy/attachments/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'academy_lesson_attachments'

    def __str__(self):
        return self.title


class Assignment(models.Model):
    """A practical task an athlete submits (video, notes, or a file) for coach review."""

    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='assignment')
    instructions = models.TextField()
    submission_type = models.CharField(
        max_length=20,
        choices=[('text', 'Text'), ('file', 'File Upload'), ('video', 'Video Upload')],
        default='text',
    )

    class Meta:
        db_table = 'academy_assignments'

    def __str__(self):
        return f'Assignment: {self.lesson.title}'


class AssignmentSubmission(models.Model):
    STATUS_CHOICES = [('submitted', 'Submitted'), ('reviewed', 'Reviewed'), ('needs_revision', 'Needs Revision')]

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignment_submissions')
    text_response = models.TextField(blank=True, default='')
    file = models.FileField(upload_to='academy/submissions/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    coach_feedback = models.TextField(blank=True, default='')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'academy_assignment_submissions'
        ordering = ['-submitted_at']

    def __str__(self):
        return f'{self.user.username} -> {self.assignment.lesson.title}'


# ==================== Quizzes ====================

class Quiz(models.Model):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=200, blank=True, default='')
    passing_score_percent = models.PositiveIntegerField(default=70)

    class Meta:
        db_table = 'academy_quizzes'

    def __str__(self):
        return self.title or f'Quiz: {self.lesson.title}'


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    explanation = models.TextField(blank=True, default='', help_text='Shown after answering, explains the correct choice.')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'academy_quiz_questions'
        ordering = ['order', 'id']

    def __str__(self):
        return self.question_text[:80]


class QuizChoice(models.Model):
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=300)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'academy_quiz_choices'
        ordering = ['order', 'id']

    def __str__(self):
        return self.choice_text


class QuizAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    score_percent = models.DecimalField(max_digits=5, decimal_places=2)
    passed = models.BooleanField(default=False)
    answers = models.JSONField(default=dict, blank=True, help_text='{question_id: choice_id}')
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'academy_quiz_attempts'
        ordering = ['-attempted_at']

    def __str__(self):
        return f'{self.user.username} - {self.quiz} ({self.score_percent}%)'


# ==================== Enrollment & Progress ====================

class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'academy_enrollments'
        constraints = [
            models.UniqueConstraint(fields=['user', 'course'], name='unique_enrollment'),
        ]
        ordering = ['-enrolled_at']

    def __str__(self):
        return f'{self.user.username} -> {self.course.title}'

    @property
    def progress_percent(self):
        total = self.course.lesson_count
        if not total:
            return 0
        done = LessonProgress.objects.filter(enrollment=self, is_completed=True).count()
        return round(done / total * 100, 1)

    @property
    def is_completed(self):
        return self.completed_at is not None


class LessonProgress(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress_records')
    is_completed = models.BooleanField(default=False)
    is_bookmarked = models.BooleanField(default=False)
    time_spent_seconds = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'academy_lesson_progress'
        constraints = [
            models.UniqueConstraint(fields=['enrollment', 'lesson'], name='unique_lesson_progress'),
        ]

    def __str__(self):
        return f'{self.enrollment.user.username} - {self.lesson.title}'


# ==================== Certificates & Achievements ====================

class Certificate(models.Model):
    """Auto-issued on course completion; certificate_number is the verifiable ID."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    certificate_number = models.CharField(max_length=40, unique=True, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'academy_certificates'
        constraints = [
            models.UniqueConstraint(fields=['user', 'course'], name='unique_certificate_per_course'),
        ]
        ordering = ['-issued_at']

    def __str__(self):
        return f'{self.certificate_number} - {self.user.username} - {self.course.title}'

    def save(self, *args, **kwargs):
        if not self.certificate_number:
            self.certificate_number = f'AF-{timezone.now():%Y%m}-{secrets.token_hex(4).upper()}'
        super().save(*args, **kwargs)


class Badge(models.Model):
    """Definition of an earnable badge (streaks, milestones, skill progression)."""

    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=50, blank=True, default='', help_text='lucide-react icon name')

    class Meta:
        db_table = 'academy_badges'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class UserBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='awarded_to')
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'academy_user_badges'
        constraints = [
            models.UniqueConstraint(fields=['user', 'badge'], name='unique_user_badge'),
        ]

    def __str__(self):
        return f'{self.user.username} - {self.badge.name}'


class LearningStreak(models.Model):
    """One row per user, updated whenever they complete a lesson."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='learning_streak')
    current_streak_days = models.PositiveIntegerField(default=0)
    longest_streak_days = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'academy_learning_streaks'

    def __str__(self):
        return f'{self.user.username}: {self.current_streak_days}d streak'


# ==================== Research Library ====================

class ResearchSummary(models.Model):
    """
    Plain-language summaries of established, general sports-science
    knowledge. Deliberately has no field claiming a specific external
    citation or "evidence level" tied to a named organization — content
    here must stay something we can actually stand behind, not a
    fabricated reference dressed up as authoritative.
    """

    title = models.CharField(max_length=250)
    slug = models.SlugField(max_length=270, unique=True, blank=True)
    topic = models.ForeignKey(CourseCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='research_summaries')
    summary = models.TextField()
    practical_takeaways = models.TextField(blank=True, default='')
    related_lessons = models.ManyToManyField(Lesson, blank=True, related_name='research_summaries')
    last_reviewed = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'academy_research_summaries'
        ordering = ['title']
        verbose_name_plural = 'research summaries'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
