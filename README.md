# Persona - Online Reservation

A modern consultation booking platform that connects individuals with professionals across various fields of expertise.

## Features

- **Browse Professionals** — Search and discover verified experts with detailed profiles
- **Real-time Availability** — View and book available consultation slots
- **Secure Authentication** — JWT-based authentication with role-based access control (USER, PERSONA, ADMIN)
- **Booking Management** — Create, confirm, cancel, and track consultation reservations
- **User Profiles** — Manage your profile and view your booking history
- **Reviews & Ratings** — Share feedback and build trust in the community

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Frontend    | Next.js 14, React 18, TypeScript, Tailwind CSS  |
| Backend     | NestJS 11, TypeScript, Prisma ORM               |
| Database    | PostgreSQL                                      |
| Auth        | JWT, bcrypt                                     |
| API Docs    | Swagger (OpenAPI)                               |
| Infrastructure | Docker, Docker Compose                        |

## Project Structure

```
persona/
│
├── backend/          # NestJS REST API
│   ├── prisma/       # Prisma schema, migrations, seed
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── users/    # User management
│   │   ├── personas/ # Professional profiles
│   │   ├── skills/   # Skill catalog
│   │   ├── availability/  # Availability slots
│   │   ├── reservations/  # Booking management
│   │   ├── common/   # Shared guards & decorators
│   │   └── prisma/   # Prisma service
│   └── Dockerfile
│
├── frontend/         # Next.js web application
│   ├── app/          # App router pages
│   ├── components/   # Shared components
│   ├── lib/          # API client, auth context
│   └── Dockerfile
│
├── docs/             # Project documentation
└── docker-compose.yml
```

---

# Quick Start (Windows 10, without Docker)

## Prerequisites

| Software         | Version   | Download                                      |
|------------------|-----------|-----------------------------------------------|
| Node.js          | 20.10+    | https://nodejs.org/                           |
| PostgreSQL       | 15+       | https://www.postgresql.org/download/windows/  |

> **Important:** You need PostgreSQL installed locally. The app requires it for the database.

## Step 1: Install PostgreSQL on Windows

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. Set a password for the `postgres` user (remember it — you'll need it below)
4. Keep the default port `5432`
5. Complete the installation

## Step 2: Create the Database

Open **SQL Shell (psql)** (or Command Prompt) and run:

```sql
CREATE DATABASE persona;
```

Or via command line:

```bash
createdb -U postgres persona
```

## Step 3: Install Dependencies

Open a terminal in the project root:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
cd frontend
npm install
```

## Step 4: Configure Environment

**Backend** — create/edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/persona?schema=public"
JWT_SECRET="super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
PORT=4000
```

> Replace `YOUR_POSTGRES_PASSWORD` with the password you set during PostgreSQL installation.

**Frontend** — create/edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## Step 5: Set Up the Database Schema & Seed Data

Open a terminal in the `backend` directory:

```bash
cd backend

# Generate the Prisma client
npx prisma generate

# Create the database tables
npx prisma migrate dev --name init

# Seed sample data (5 personas, 12 skills, availability slots)
npm run prisma:seed
```

## Step 6: Run the Application

Open **two terminals**:

**Terminal 1 — Backend** (runs on port `4000`):

```bash
cd backend
npm run start:dev
```

**Terminal 2 — Frontend** (runs on port `3000`):

```bash
cd frontend
npm run dev
```

## Step 7: Access the Application

| Service        | URL                              |
|----------------|----------------------------------|
| Frontend       | http://localhost:3000            |
| Backend API    | http://localhost:4000/api/v1     |
| Swagger Docs   | http://localhost:4000/api/docs   |

---

# Demo Accounts

After seeding, you can log in with:

| Role      | Email                | Password     |
|-----------|----------------------|--------------|
| Admin     | admin@persona.com    | admin12345   |
| Persona   | john@example.com     | password123  |
| Persona   | jane@example.com     | password123  |
| User      | mike@example.com     | password123  |
| Persona   | sarah@example.com    | password123  |
| Persona   | david@example.com    | password123  |

> All 5 sample users have persona profiles with availability slots.

---

# Common Issues (Windows)

### "ECONNREFUSED" when connecting to database
- Make sure PostgreSQL service is running: `net start postgresql-x64-16` (Run as Administrator)
- Check the DATABASE_URL password matches your PostgreSQL password

### Port 4000 or 3000 already in use
- Change the port in `backend/.env` (`PORT=4001`) or start frontend with `npm run dev -- -p 3001`

### "Prisma only supports Node.js versions 20.19+"
- Update Node.js to the latest LTS version from https://nodejs.org/

---

# API Endpoints

### Authentication

| Method | Endpoint           | Description                |
|--------|--------------------|----------------------------|
| POST   | `/auth/register`   | Register a new user        |
| POST   | `/auth/login`      | Login and get tokens       |
| POST   | `/auth/refresh`    | Refresh access token       |

### Users

| Method | Endpoint     | Description              |
|--------|--------------|--------------------------|
| GET    | `/users/me`  | Get current user profile |
| PATCH  | `/users/me`  | Update current user      |

### Personas

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/personas`               | List personas (searchable)           |
| GET    | `/personas/:id`           | Get persona by ID                    |
| POST   | `/personas`               | Create persona (USER or ADMIN)       |
| PATCH  | `/personas/:id`           | Update persona (owner or ADMIN)      |
| DELETE | `/personas/:id`           | Delete persona (owner or ADMIN)      |
| PATCH  | `/personas/:id/verify`    | Verify persona (ADMIN only)          |

### Availability

| Method | Endpoint                          | Description                  |
|--------|-----------------------------------|------------------------------|
| GET    | `/personas/:personaId/availability` | List availability slots     |
| POST   | `/personas/:personaId/availability` | Create availability slot     |
| DELETE | `/availability/:id`              | Delete availability slot     |

### Reservations

| Method | Endpoint               | Description                  |
|--------|------------------------|------------------------------|
| POST   | `/reservations`        | Create a booking             |
| GET    | `/reservations/me`     | List my reservations         |
| GET    | `/reservations/:id`    | Get reservation by ID        |
| PATCH  | `/reservations/:id/status` | Update status (persona)    |
| PATCH  | `/reservations/:id/cancel` | Cancel reservation         |

### Skills

| Method | Endpoint     | Description            |
|--------|--------------|------------------------|
| GET    | `/skills`    | List all skills        |
| POST   | `/skills`    | Create skill (admin)   |

---

# Running with Docker (Alternative)

If you have Docker Desktop installed:

```bash
docker-compose up --build
```

This starts PostgreSQL, backend, and frontend containers.

---

# Documentation

Full documentation is available in the [`docs/`](docs/README.md) directory:

- **Architecture** — System design, tech stack, deployment
- **Database** — Schema, ERD, migrations
- **API** — Modules, authentication, endpoints
- **UI** — Design system, wireframes, components, user flows
- **ADR** — Architecture Decision Records

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.