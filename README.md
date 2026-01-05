# SnelROI Project

## Overview
This monorepo contains the customer-facing banking UI, an admin UI, and a Django backend that simulates full bank account workflows with a ledger-based accounting model.

### Apps
- **Customer UI**: `snel-roi-bank` (React + Vite + Tailwind)
- **Admin UI**: `snel-roi-admin` (React + Vite + Tailwind)
- **Backend**: `backend` (Django + DRF + PostgreSQL + Redis + Celery)

## Architecture
- Ledger-based accounting (`LedgerEntry` + `LedgerPosting`) ensures balances are computed from postings, not incremented fields.
- Deposits can auto-post after a delay; transfers and withdrawals require admin approval.
- Celery + Redis handle asynchronous tasks (auto-posting deposits, statement generation).

## Local Development

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_system
python manage.py runserver
```

### Celery Worker
```bash
cd backend
celery -A banking worker -l info
```

### Customer UI
```bash
cd snel-roi-bank
npm install
VITE_API_URL=http://localhost:8000/api npm run dev
```

### Admin UI
```bash
cd snel-roi-admin
npm install
VITE_API_URL=http://localhost:8000/api npm run dev
```

## Docker (Coolify Friendly)
```bash
cp .env.example .env
# Update values as needed

docker-compose up --build
```

Containers expose internal ports only; Coolify can attach domains per service.

## Demo Credentials
- Admin user is created by `python manage.py seed_system` using:
  - `SYSTEM_USER_EMAIL`
  - `SYSTEM_USER_PASSWORD`

## Approval Flow
- **Deposits**: created as PENDING and auto-posted after a short delay (configurable).
- **Transfers/Withdrawals**: created as PENDING and require admin approval via the admin UI.
- Admin actions are recorded on the ledger entry.

## Notes
- JWT is stored in localStorage for this MVP demo. Update to more secure storage for production.
- Both frontends use `VITE_API_URL` to reach the backend API.
