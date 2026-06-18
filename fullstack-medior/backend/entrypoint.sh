#!/bin/sh
set -e

# Apply schema, load synthetic demo data (idempotent), then serve.
python manage.py migrate --noinput
python manage.py seed
exec python manage.py runserver 0.0.0.0:8000
