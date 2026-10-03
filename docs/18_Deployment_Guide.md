# 18. Deployment Guide

1. **Database**: Migrate from SQLite to PostgreSQL by updating `DATABASES` in `settings.py` and installing `psycopg2`.
2. **Backend Hosting**: Deploy Django using Gunicorn behind an Nginx reverse proxy (e.g., on AWS EC2 or Heroku).
3. **Frontend Hosting**: Run `npm run build` to generate the static dist folder. Serve via Vercel, Netlify, or Nginx.
4. **Environment**: Ensure `.env` contains secure `SECRET_KEY`, `DEBUG=False`, and correct `ALLOWED_HOSTS`.