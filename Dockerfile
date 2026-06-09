# AthleteForge — production image (Railway / any Docker host)
FROM node:20-alpine AS frontend
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN VITE_API_URL=/api npm run build

FROM python:3.12-slim AS backend
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY --from=frontend /build/dist ./frontend_dist

ENV PYTHONUNBUFFERED=1
ENV DEBUG=False
ENV SAME_ORIGIN_DEPLOY=True

RUN python manage.py collectstatic --no-input

EXPOSE 8000
CMD sh -c "python manage.py migrate --no-input && python manage.py setup_admin && python manage.py seed_data && gunicorn athlete_system.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --threads 2 --timeout 120 --preload"