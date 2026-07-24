from django.contrib import admin

from .models import (
    Organization, OrgRole, OrganizationMembership, ParentAthleteLink,
    Sport, CourseCategory, Course, CourseVersion, CourseModule, Lesson,
    LessonFAQ, LessonAttachment, Assignment, AssignmentSubmission,
    Quiz, QuizQuestion, QuizChoice, QuizAttempt,
    Enrollment, LessonProgress, Certificate, Badge, UserBadge,
    LearningStreak, ResearchSummary,
)


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'org_type', 'parent_organization', 'is_active', 'created_at')
    list_filter = ('org_type', 'is_active')
    search_fields = ('name',)


@admin.register(OrgRole)
class OrgRoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'is_system')
    list_filter = ('is_system', 'organization')
    filter_horizontal = ('permissions',)


@admin.register(OrganizationMembership)
class OrganizationMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'organization', 'role', 'is_primary', 'is_active')
    list_filter = ('organization', 'role', 'is_active')
    search_fields = ('user__username', 'user__email')


@admin.register(ParentAthleteLink)
class ParentAthleteLinkAdmin(admin.ModelAdmin):
    list_display = ('parent', 'athlete', 'relationship', 'is_verified')


@admin.register(Sport)
class SportAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(CourseCategory)
class CourseCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'sport', 'parent', 'order')
    list_filter = ('sport',)
    prepopulated_fields = {'slug': ('name',)}


class CourseModuleInline(admin.TabularInline):
    model = CourseModule
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'level', 'status', 'organization', 'lesson_count', 'updated_at')
    list_filter = ('status', 'level', 'category')
    search_fields = ('title',)
    prepopulated_fields = {'slug': ('title',)}
    inlines = [CourseModuleInline]


@admin.register(CourseVersion)
class CourseVersionAdmin(admin.ModelAdmin):
    list_display = ('course', 'version', 'created_at')


class LessonFAQInline(admin.TabularInline):
    model = LessonFAQ
    extra = 1


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'lesson_type', 'order', 'is_published')
    list_filter = ('lesson_type', 'is_published')
    search_fields = ('title',)
    inlines = [LessonFAQInline]


admin.site.register(LessonAttachment)


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'submission_type')


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'assignment', 'status', 'submitted_at')
    list_filter = ('status',)


class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 1


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson', 'passing_score_percent')
    inlines = [QuizQuestionInline]


class QuizChoiceInline(admin.TabularInline):
    model = QuizChoice
    extra = 2


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'quiz')
    inlines = [QuizChoiceInline]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'quiz', 'score_percent', 'passed', 'attempted_at')
    list_filter = ('passed',)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'enrolled_at', 'completed_at')
    list_filter = ('course',)


admin.site.register(LessonProgress)


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('certificate_number', 'user', 'course', 'issued_at')
    search_fields = ('certificate_number', 'user__username')


admin.site.register(Badge)
admin.site.register(UserBadge)
admin.site.register(LearningStreak)


@admin.register(ResearchSummary)
class ResearchSummaryAdmin(admin.ModelAdmin):
    list_display = ('title', 'topic', 'last_reviewed')
    prepopulated_fields = {'slug': ('title',)}
