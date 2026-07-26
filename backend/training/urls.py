from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'programs', views.TrainingProgramViewSet, basename='training-programs')
router.register(r'days', views.ProgramDayViewSet, basename='training-days')
router.register(r'blocks', views.ProgramBlockViewSet, basename='training-blocks')
router.register(r'exercises', views.ProgramExerciseViewSet, basename='training-exercises')
router.register(r'wellness', views.WellnessCheckInViewSet, basename='training-wellness')
router.register(r'rpe', views.SessionRPEViewSet, basename='training-rpe')
router.register(r'test-protocols', views.TestProtocolViewSet, basename='training-test-protocols')
router.register(r'test-results', views.TestResultViewSet, basename='training-test-results')

urlpatterns = [
    path('generator/status/', views.generator_status, name='generator-status'),
    path('', include(router.urls)),
]
