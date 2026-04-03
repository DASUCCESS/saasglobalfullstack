# Backend (Django + DRF)

## 1) Environment setup

Create env file from template:

```bash
cd backend
cp .env.example .env
```

Update PostgreSQL credentials in `.env` (`POSTGRES_*`). This backend is configured to use PostgreSQL only.

## 2) Install and run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_products
python manage.py runserver
```

## 3) Production entrypoint

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

## API summary
- Products: `GET /api/products-page/`, `GET/POST /api/products/`, `GET/PATCH/DELETE /api/products/<slug>/`
- Product upload: `POST /api/products/upload-image/`
- Settings: `GET /api/settings/public/`, `GET /api/settings/admin/`, `PATCH /api/settings/admin/update/`, `POST /api/settings/payment/refresh-rate/`
- Requests: `POST /api/requests/`
- SEO: `GET /api/seo/<page_key>/`
- AI: `GET /api/ai/settings/`, `POST /api/ai/ask/`
- Auth: `POST /api/auth/register/`, `POST /api/auth/login/`, `POST /api/auth/google/`, `GET /api/auth/me/`, `POST /api/auth/admin/register/`
- Payments/dashboard: `POST /api/payments/start/`, `POST /api/payments/verify/`, `GET /api/dashboard/`, `GET/POST /api/dashboard/orders/<id>/messages/`
