from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'sports', views.SportViewSet, basename='sports')
router.register(r'categories', views.CourseCategoryViewSet, basename='categories')
router.register(r'courses', views.CourseViewSet, basename='courses')
router.register(r'lessons', views.LessonViewSet, basename='lessons')
router.register(r'enrollments', views.EnrollmentViewSet, basename='enrollments')
router.register(r'certificates', views.CertificateViewSet, basename='certificates')
router.register(r'badges', views.MyBadgesViewSet, basename='my-badges')
router.register(r'research', views.ResearchSummaryViewSet, basename='research')
router.register(r'organizations', views.OrganizationViewSet, basename='organizations')
router.register(r'roles', views.OrgRoleViewSet, basename='org-roles')
router.register(r'memberships', views.OrganizationMembershipViewSet, basename='memberships')

urlpatterns = [
    path('learning-summary/', views.my_learning_summary, name='learning-summary'),
    path('permissions/', views.available_permissions, name='available-permissions'),
    path('', include(router.urls)),
]
