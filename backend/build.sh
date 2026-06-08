#!/usr/bin/env bash
# Render.com build script for AthleteForge Django backend
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate --no-input
python manage.py setup_admin
python manage.py seed_data