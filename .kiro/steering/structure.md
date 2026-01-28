# Project Structure

## Monorepo Organization

```
├── backend/                    # Django API backend
├── snel-roi-bank/             # Customer-facing React UI
├── snel-roi-admin/            # Admin dashboard React UI
├── docker-compose.*.yml       # Container orchestration
└── .env.example              # Environment template
```

## Backend Structure (`backend/`)

```
backend/
├── banking/                   # Django project settings
│   ├── settings.py           # Main configuration
│   ├── urls.py              # Root URL routing
│   ├── asgi.py              # ASGI application (WebSockets)
│   └── celery.py            # Celery configuration
├── bank/                     # Main Django app
│   ├── models.py            # Database models (ledger system)
│   ├── views.py             # API endpoints
│   ├── serializers.py       # DRF serializers
│   ├── services.py          # Business logic layer
│   ├── tasks.py             # Celery tasks
│   ├── urls.py              # App URL routing
│   ├── consumers.py         # WebSocket consumers
│   ├── emails.py            # Email utilities
│   ├── middleware.py        # Custom middleware
│   └── migrations/          # Database migrations
├── templates/emails/         # Email templates
├── sent_emails/             # Email logs (development)
├── manage.py               # Django management
├── requirements.txt        # Python dependencies
└── Dockerfile             # Container definition
```

## Frontend Structure (Both UIs)

```
src/
├── components/              # Reusable UI components
│   ├── ui/                 # shadcn/ui components
│   ├── auth/               # Authentication components
│   └── layout/             # Layout components
├── pages/                  # Route components
│   ├── app/               # Authenticated pages (bank UI)
│   └── features/          # Feature detail pages
├── services/              # API service layers
├── context/               # React contexts (Auth, Language)
├── lib/                   # Utilities and configurations
│   ├── api.ts            # API client setup
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom React hooks
├── i18n/                  # Internationalization
├── assets/               # Static assets
└── layouts/              # Page layouts
```

## Key Architectural Patterns

### Backend Patterns
- **Service Layer**: Business logic in `services.py`, views handle HTTP concerns only
- **Ledger System**: Double-entry accounting with `LedgerEntry` and `LedgerPosting` models
- **Task Queue**: Async operations (auto-posting, emails) handled by Celery
- **WebSocket Consumers**: Real-time updates via Django Channels
- **Email Templates**: HTML templates in `templates/emails/`

### Frontend Patterns
- **Service Layer**: API calls abstracted in `services/` directory
- **Context Providers**: Global state (auth, language) via React Context
- **Component Library**: Consistent UI with shadcn/ui + Radix primitives
- **Form Handling**: React Hook Form + Zod validation pattern
- **Query Management**: TanStack Query for server state
- **Route Protection**: Auth guards for protected routes

## File Naming Conventions

### Backend (Python)
- Models: PascalCase classes (`CustomerProfile`, `LedgerEntry`)
- Files: snake_case (`models.py`, `services.py`)
- URLs: kebab-case (`/auth/password-reset/request`)

### Frontend (TypeScript/React)
- Components: PascalCase (`Dashboard.tsx`, `TransactionIcon.tsx`)
- Files: camelCase for utilities (`api.ts`, `utils.ts`)
- Directories: kebab-case (`snel-roi-bank`, `crypto-wallets`)

## Configuration Files

- **Docker**: Multi-stage builds with separate dev/prod compose files
- **Environment**: `.env.example` template, environment-specific overrides
- **Build Tools**: Vite config, Tailwind config, TypeScript config per frontend
- **Linting**: ESLint configuration for code quality