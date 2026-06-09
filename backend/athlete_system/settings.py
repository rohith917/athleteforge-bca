"""
Django settings for AthleteForge - Athlete Performance and Injury Tracking System.
AthleteForge - Athlete Performance System
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIST = BASE_DIR / 'frontend_dist'

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-bca-athlete-tracking-change-in-production')

DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

_default_hosts = 'localhost,127.0.0.1,athleteforge-bca.onrender.com,.onrender.com,.railway.app,.up.railway.app'
ALLOWED_HOSTS = [
    h.strip() for h in os.getenv('ALLOWED_HOSTS', _default_hosts).split(',') if h.strip()
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'athlete_system.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'athlete_system.wsgi.application'

# Database: PostgreSQL (Render) > SQLite (local) > MySQL (local)
import dj_database_url
from django.core.exceptions import ImproperlyConfigured

DATABASE_URL = os.getenv('DATABASE_URL')
IS_RENDER = os.getenv('RENDER', '').lower() in ('true', '1', 'yes')

if DATABASE_URL:
    # Production: Render PostgreSQL (recommended for free deploy)
    DATABASES = {'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)}
elif os.getenv('USE_SQLITE', 'False').lower() == 'true':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
elif not DEBUG or IS_RENDER:
    raise ImproperlyConfigured(
        'DATABASE_URL is required on Render/production. '
        'Create a PostgreSQL database on Render, copy the Internal Database URL, '
        'and add it as the DATABASE_URL environment variable on your web service.'
    )
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': os.getenv('DB_NAME', 'athlete_tracking_db'),
            'USER': os.getenv('DB_USER', 'root'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '3306'),
            'OPTIONS': {'charset': 'utf8mb4'},
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS - Allow React frontend (local + production)
_extra_origins = [
    o.strip() for o in os.getenv('CORS_ALLOWED_ORIGINS', '').split(',') if o.strip()
]
_frontend_url = os.getenv('FRONTEND_URL', '').strip()
_default_origins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://athleteforge-frontend.onrender.com',
    'https://athleteforge-bca.onrender.com',
]
# Railway production domains added via env (FRONTEND_URL / CORS_ALLOWED_ORIGINS)
if _frontend_url:
    _default_origins.append(_frontend_url)

CORS_ALLOWED_ORIGINS = list(dict.fromkeys(_default_origins + _extra_origins))
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# Session & CSRF (required for cross-origin React + Django on Render)
SESSION_COOKIE_AGE = 86400
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False  # React needs to read csrftoken cookie

_same_origin = os.getenv('SAME_ORIGIN_DEPLOY', 'True').lower() == 'true'

if DEBUG:
    SESSION_COOKIE_SAMESITE = 'Lax'
    CSRF_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
elif _same_origin:
    # Frontend served from same domain — works on mobile Safari
    SESSION_COOKIE_SAMESITE = 'Lax'
    CSRF_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
else:
    SESSION_COOKIE_SAMESITE = 'None'
    CSRF_COOKIE_SAMESITE = 'None'
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# Cross-site frontend cannot read HttpOnly session cookie — only API domain stores it
SESSION_COOKIE_PATH = '/'
CSRF_COOKIE_PATH = '/'

_extra_csrf = [
    o.strip() for o in os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',') if o.strip()
]
CSRF_TRUSTED_ORIGINS = list(dict.fromkeys(CORS_ALLOWED_ORIGINS + _extra_csrf))

# Keep sessions alive during active use (helps mobile browsers)
SESSION_SAVE_EVERY_REQUEST = True
SESSION_COOKIE_NAME = 'athleteforge_sessionid'

# Render.com sits behind a proxy
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')