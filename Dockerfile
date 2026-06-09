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

# collectstatic does not need Postgres at image build time
RUN USE_SQLITE=True python manage.py collectstatic --no-input

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8000
CMD ["/docker-entrypoint.sh"]