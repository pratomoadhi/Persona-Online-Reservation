# Database Migrations

Persona uses **Prisma Migrate** to manage database schema changes.

---

# Migration Workflow

## Creating a Migration

After modifying the Prisma schema, generate a migration:

```bash
npx prisma migrate dev --name <migration_name>
```

This command:

1. Detects schema changes
2. Creates a new migration file
3. Applies the migration to the development database
4. Regenerates the Prisma Client

## Applying Migrations

To apply pending migrations in a non-development environment:

```bash
npx prisma migrate deploy
```

## Resetting the Database

To reset the development database and re-apply all migrations:

```bash
npx prisma migrate reset
```

---

# Migration Directory Structure

```
backend/prisma/
│
├── migrations/
│   ├── migration_lock.toml
│   ├── 20260101000000_init/
│   │   ├── migration.sql
│   │   └── README.md
│   ├── 20260102000000_add_persona_skills/
│   │   └── migration.sql
│   └── ...
│
├── schema.prisma
└── seed.ts
```

---

# Initial Migration

The initial migration creates the core tables:

- User
- Persona
- Skill
- PersonaSkill
- Availability
- Reservation
- Review
- Notification

---

# Migration Naming Convention

Migrations follow the format:

```
YYYYMMDDHHMMSS_<descriptive_name>
```

Examples:

- `20260101000000_init`
- `20260102000000_add_persona_skills`
- `20260103000000_add_review_moderation`

---

# Seeding

The database includes a seed script to populate development data.

```bash
npx prisma db seed
```

Seed data includes:

- Admin user
- Sample users
- Sample personas
- Skills
- Availability slots
- Sample reservations
- Sample reviews

---

# Best Practices

- Always review generated SQL before applying
- Never edit applied migration files
- Use descriptive migration names
- Test migrations in a staging environment first
- Keep migrations small and focused
- Include rollback plans for destructive changes

---

# Rollback Strategy

Prisma does not support automatic rollback. To revert a migration:

1. Manually write a down migration SQL
2. Apply it to the database
3. Delete the migration record from `_prisma_migrations`

---

# Production Considerations

- Use `prisma migrate deploy` in CI/CD pipelines
- Back up the database before applying migrations
- Schedule migrations during low-traffic windows
- Monitor migration logs for errors

---