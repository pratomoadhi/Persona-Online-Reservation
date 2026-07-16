# Repository Structure

The project follows a monorepo approach.

```
persona/
│
├── frontend/
│
├── backend/
│
├── docs/
│
├── docker/
│
├── .github/
│
├── docker-compose.yml
├── README.md
└── LICENSE

```

---

# Frontend

```
frontend/
│
├── app/
│
├── components/
│
├── features/
│
├── hooks/
│
├── lib/
│
├── services/
│
├── types/
│
├── styles/
│
└── public/

```

---

# Backend


```
backend/
│
├── src/
│
├── auth/
│
├── users/
│
├── personas/
│
├── skills/
│
├── availability/
│
├── reservations/
│
├── reviews/
│
├── notifications/
│
├── common/
│
├── config/
│
├── prisma/
│
└── test/

```

---

# Naming Conventions

```

Folders

- kebab-case

Components

- PascalCase

Functions

- camelCase

Environment Variables

- UPPER_SNAKE_CASE

```

---

# Branch Strategy

```

main -- Production

develop -- Integration

feature/* -- New Features

fix/*  -- Bug Fixes

hotfix/* -- Critical Fixes

```

---

# Commit Convention

```

feat:

fix:

docs:

style:

refactor:

test:

chore:

```

---