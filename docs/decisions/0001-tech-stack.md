# ADR 0001: Technology Stack

- **Status:** Accepted
- **Date:** 2026-01-01
- **Deciders:** Project Team

---

# Context

Persona is a consultation booking platform that needs to support:

- Public browsing of professional profiles
- Real-time availability management
- Secure booking and authentication
- Reviews and ratings
- Future scalability to payments and video consultations

The team needed to select a technology stack that balances developer experience, performance, scalability, and long-term maintainability.

---

# Decision

## Frontend

- **Next.js** (React framework)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (component library)
- **TanStack Query** (server state)
- **React Hook Form** (forms)
- **Zod** (validation)

## Backend

- **NestJS** (Node.js framework)
- **TypeScript**
- **Prisma** (ORM)
- **JWT** (authentication)
- **bcrypt** (password hashing)
- **Swagger** (API documentation)

## Database

- **PostgreSQL**

## Infrastructure

- **Docker**
- **Nginx** (reverse proxy)
- **GitHub Actions** (CI/CD)

## Deployment

- **Vercel** (frontend)
- **Railway** (backend)
- **PostgreSQL** (managed database)

---

# Alternatives Considered

## Frontend

| Alternative | Reason Rejected |
|-------------|-----------------|
| Vue.js      | Smaller ecosystem for this use case |
| Svelte      | Less mature tooling |
| Angular     | Heavier, more opinionated |

## Backend

| Alternative | Reason Rejected |
|-------------|-----------------|
| Express     | Less structure, harder to scale |
| Fastify     | Smaller ecosystem |
| Django      | Different language, team preference for TS |
| Laravel     | Different language, team preference for TS |

## Database

| Alternative | Reason Rejected |
|-------------|-----------------|
| MySQL       | Fewer advanced features |
| MongoDB     | Relational data model fits better |
| SQLite      | Not suitable for production scale |

---

# Consequences

## Positive

- Type safety across the entire stack
- Excellent developer experience
- Strong community support
- Scalable architecture
- Fast development velocity
- Easy hiring and onboarding

## Negative

- Requires Node.js runtime knowledge
- Monorepo complexity
- Dependency on third-party services (Vercel, Railway)

## Neutral

- Team must stay current with framework updates
- Some tooling decisions may need revisiting

---

# Compliance

This decision aligns with the project's guiding principles:

- API-first architecture
- Component-driven development
- Clean code
- Scalable infrastructure
- Excellent developer experience

---