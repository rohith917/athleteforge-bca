from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'programs', views.TrainingProgramViewSet, basename='training-programs')
router.register(r'days', views.ProgramDayViewSet, basename='training-days')
router.register(r'blocks', views.ProgramBlockViewSet, basename='training-blocks')
router.register(r'exercises', views.ProgramExerciseViewSet, basename='training-exercises')

urlpatterns = [
    path('', include(router.urls)),
]
