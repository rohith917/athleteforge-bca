"""
API URL routing for all endpoints.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'athletes', views.AthleteViewSet)
router.register(r'performance', views.PerformanceViewSet)
router.register(r'injuries', views.InjuryViewSet)
router.register(r'competitions', views.CompetitionViewSet)
router.register(r'competition-results', views.CompetitionResultViewSet)
router.register(r'attendance', views.AttendanceViewSet)
router.register(r'weight-tracking', views.WeightTrackingViewSet)

urlpatterns = [
    # Authentication
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/user/', views.CurrentUserView.as_view(), name='current-user'),

    # AI Insights
    path('ai/insights/', views.ai_insights, name='ai-insights'),

    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),

    # Admin management
    path('admin/stats/', views.admin_dashboard_stats, name='admin-stats'),
    path('admin/users/', views.AdminUserViewSet.as_view({'get': 'list', 'post': 'create'}), name='admin-users'),
    path('admin/users/<int:pk>/', views.AdminUserViewSet.as_view({
        'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy',
    }), name='admin-user-detail'),

    # Reports
    path('reports/pdf/', views.export_pdf, name='export-pdf'),
    path('reports/excel/', views.export_excel, name='export-excel'),

    # CRUD routes via router
    path('', include(router.urls)),
]