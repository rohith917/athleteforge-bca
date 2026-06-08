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
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/user/', views.CurrentUserView.as_view(), name='current-user'),

    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),

    # Reports
    path('reports/pdf/', views.export_pdf, name='export-pdf'),
    path('reports/excel/', views.export_excel, name='export-excel'),

    # CRUD routes via router
    path('', include(router.urls)),
]