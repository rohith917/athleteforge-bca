"""
Main URL configuration for Athlete Performance and Injury Tracking System.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static

from spa_views import serve_frontend_asset, serve_frontend_image, serve_spa

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/academy/', include('academy.urls')),
    re_path(r'^assets/(?P<path>.*)$', serve_frontend_asset),
    re_path(r'^images/(?P<path>.*)$', serve_frontend_image),
    re_path(r'^(?!api/|admin/|static/|media/|images/).*$', serve_spa),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)