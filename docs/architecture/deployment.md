# Deployment Strategy

Persona follows a cloud-native deployment model.

---

# Environments

Development

Local Docker environment.

Testing

GitHub Actions.

Production

Cloud deployment.

---

# Architecture

```

Browser

↓

Vercel

↓

NestJS API

↓

PostgreSQL

↓

Object Storage

```

---

# Docker

The application is fully containerized.

Services:

- frontend
- backend
- postgres

Future:

- nginx
- redis

---

# CI/CD

GitHub Actions

Workflow

1. Install dependencies
2. Run tests
3. Build frontend
4. Build backend
5. Docker build
6. Deploy

---

# Environment Variables

Frontend

NEXT_PUBLIC_API_URL

Backend

DATABASE_URL

JWT_SECRET

PORT

---

# Monitoring

Future integrations

- Sentry
- Prometheus
- Grafana

---

# Backup Strategy

Database

Daily backup

Storage

Versioned object storage

---

# Security

- HTTPS only
- JWT Authentication
- Password hashing
- CORS
- Helmet
- Rate limiting

---

# Future Scaling

Current

Monolithic Backend

Future

Microservices

API Gateway

Message Queue

Distributed Cache

This transition should not require frontend changes due to the API-first architecture.

---