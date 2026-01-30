# Technology Stack

## Backend
- **Framework**: Django 5.0.6 with Django REST Framework
- **Database**: PostgreSQL with psycopg2-binary
- **Authentication**: JWT with djangorestframework-simplejwt
- **Task Queue**: Celery with Redis broker
- **WebSockets**: Django Channels with Daphne ASGI server
- **Email**: Django email backend with SMTP support
- **File Storage**: Django file handling with Pillow for images

## Frontend (Both UIs)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Animations**: Framer Motion

## Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose (local and production configs)
- **Reverse Proxy**: Nginx (in production containers)
- **Static Files**: WhiteNoise for Django static file serving

## Common Development Commands

### Backend Development
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
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

### Customer UI Development
```bash
cd snel-roi-bank
npm install
VITE_API_URL=http://localhost:8000/api npm run dev
```

### Admin UI Development
```bash
cd snel-roi-admin
npm install
VITE_API_URL=http://localhost:8000/api npm run dev
```

### Docker Development
```bash
# Local development
cp .env.example .env
docker-compose -f docker-compose.local.yml up --build

# Production
docker-compose -f docker-compose.prod.yml up -d --build
```

### Build Commands
```bash
# Frontend builds
npm run build          # Production build
npm run build:dev      # Development build
npm run preview        # Preview production build

# Backend
python manage.py collectstatic  # Collect static files
```

## Environment Variables
- `VITE_API_URL`: Frontend API endpoint
- `DJANGO_SECRET_KEY`: Django secret key
- `DJANGO_DEBUG`: Debug mode toggle
- `POSTGRES_*`: Database connection settings
- `CELERY_BROKER_URL`: Redis connection for Celery
- `USE_SMTP_EMAIL`: Email backend toggle