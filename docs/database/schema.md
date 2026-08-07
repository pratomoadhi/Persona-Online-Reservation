# Database Schema

Persona uses **PostgreSQL** as the primary database with **Prisma** as the ORM.

---

# Entity Overview

The database consists of the following core entities:

- User
- Persona
- Skill
- PersonaSkill
- Availability
- Reservation
- Review
- Notification

---

# Tables

## User

Represents a registered account on the platform.

| Column         | Type      | Constraints          | Description                    |
|----------------|-----------|----------------------|--------------------------------|
| id             | UUID      | PK, default gen     | Unique user identifier        |
| email          | VARCHAR   | UNIQUE, NOT NULL    | User email address            |
| passwordHash   | VARCHAR   | NOT NULL            | bcrypt-hashed password        |
| fullName       | VARCHAR   | NOT NULL            | Display name                  |
| avatarUrl      | VARCHAR   | NULL                | Profile avatar                |
| role           | ENUM      | NOT NULL, default USER | `USER`, `PERSONA`, `ADMIN`  |
| isVerified     | BOOLEAN   | NOT NULL, default false | Email verification status  |
| createdAt      | TIMESTAMP | NOT NULL, default now | Creation time                |
| updatedAt      | TIMESTAMP | NOT NULL, on update  | Last update time              |

---

## Persona

Represents a professional providing consultation services.

| Column         | Type      | Constraints          | Description                       |
|----------------|-----------|----------------------|-----------------------------------|
| id             | UUID      | PK, default gen     | Unique persona identifier         |
| userId         | UUID      | FK -> User.id       | Owning user account               |
| headline       | VARCHAR   | NOT NULL            | Professional headline             |
| bio            | TEXT      | NULL                | Professional biography            |
| hourlyRate     | DECIMAL   | NULL                | Rate per consultation (future)    |
| rating         | FLOAT     | NOT NULL, default 0 | Average rating                    |
| ratingCount    | INTEGER   | NOT NULL, default 0 | Number of ratings                 |
| isVerified     | BOOLEAN   | NOT NULL, default false | Admin verification status     |
| createdAt      | TIMESTAMP | NOT NULL, default now | Creation time                   |
| updatedAt      | TIMESTAMP | NOT NULL, on update  | Last update time                 |

---

## Skill

Represents a skill or area of expertise.

| Column         | Type      | Constraints          | Description                    |
|----------------|-----------|----------------------|--------------------------------|
| id             | UUID      | PK, default gen     | Unique skill identifier        |
| name           | VARCHAR   | UNIQUE, NOT NULL    | Skill name                     |
| category       | VARCHAR   | NULL                | Skill category                 |
| createdAt      | TIMESTAMP | NOT NULL, default now | Creation time                |

---

## PersonaSkill

Junction table linking personas to their skills.

| Column         | Type      | Constraints          | Description                    |
|----------------|-----------|----------------------|--------------------------------|
| personaId      | UUID      | FK -> Persona.id    | Persona reference              |
| skillId        | UUID      | FK -> Skill.id      | Skill reference                |
| level          | ENUM      | NOT NULL, default BEGINNER | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT` |
| createdAt      | TIMESTAMP | NOT NULL, default now | Creation time                |

Composite primary key: `(personaId, skillId)`

---

## Availability

Represents a time slot where a persona is available for consultation.

| Column         | Type      | Constraints          | Description                    |
|----------------|-----------|----------------------|--------------------------------|
| id             | UUID      | PK, default gen     | Unique availability identifier |
| personaId      | UUID      | FK -> Persona.id    | Persona reference              |
| startTime      | TIMESTAMP | NOT NULL            | Slot start time                |
| endTime        | TIMESTAMP | NOT NULL            | Slot end time                  |
| isBooked       | BOOLEAN   | NOT NULL, default false | Whether the slot is reserved |
| createdAt      | TIMESTAMP | NOT NULL, default now | Creation time                |
| updatedAt      | TIMESTAMP | NOT NULL, on update  | Last update time              |

Constraint: `endTime > startTime`

---

## Reservation

Represents a booking of a consultation session.

| Column         | Type      | Constraints          | Description                     |
|----------------|-----------|----------------------|---------------------------------|
| id             | UUID      | PK, default gen     | Unique reservation identifier   |
| userId         | UUID      | FK -> User.id       | Customer who booked             |
| personaId      | UUID      | FK -> Persona.id    | Persona being booked            |
| availabilityId | UUID      | FK -> Availability.id | Linked time slot             |
| status         | ENUM      | NOT NULL, default PENDING | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED` |
| notes          | TEXT      | NULL                | Customer message                |
| createdAt      | TIMESTAMP | NOT NULL, default now | Creation time                 |
| updatedAt      | TIMESTAMP | NOT NULL, on update  | Last update time               |

---

## Review

Represents a review left by a user after a completed consultation.

| Column         | Type      | Constraints          | Description                    |
|----------------|-----------|----------------------|--------------------------------|
| id             | UUID      | PK, default gen     | Unique review identifier       |
| userId         | UUID      | FK -> User.id       | Reviewer                       |
| personaId      | UUID      | FK -> Persona.id    | Persona being reviewed         |
| reservationId  | UUID      | FK -> Reservation.id | Associated booking           |
| rating         | SMALLINT  | NOT NULL, 1-5       | Star rating                    |
| comment        | TEXT      | NULL                | Review comment                 |
| isApproved     | BOOLEAN   | NOT NULL, default false | Admin moderation status    |
| createdAt      | TIMESTAMP | NOT NULL, default now | Creation time                |

Constraint: `rating BETWEEN 1 AND 5`

---

## Notification

Represents an in-app notification for a user.

| Column         | Type      | Constraints          | Description                    |
|----------------|-----------|----------------------|--------------------------------|
| id             | UUID      | PK, default gen     | Unique notification identifier |
| userId         | UUID      | FK -> User.id       | Recipient                      |
| type           | ENUM      | NOT NULL            | `BOOKING`, `MESSAGE`, `SYSTEM` |
| title          | VARCHAR   | NOT NULL            | Notification title             |
| body           | TEXT      | NULL                | Notification content            |
| isRead         | BOOLEAN   | NOT NULL, default false | Read status                 |
| createdAt      | TIMESTAMP | NOT NULL, default now | Creation time                |

---

# Relationships Summary

| Relationship                | Type        | Description                              |
|-----------------------------|-------------|------------------------------------------|
| User 1 — 1 Persona          | One-to-One  | A verified user may own a persona profile |
| Persona M — N Skill         | Many-to-Many| Via PersonaSkill junction table          |
| Persona 1 — M Availability  | One-to-Many | A persona has multiple availability slots|
| User 1 — M Reservation      | One-to-Many| A user can have multiple bookings         |
| Persona 1 — M Reservation   | One-to-Many| A persona receives multiple bookings      |
| User 1 — M Review           | One-to-Many| A user can leave multiple reviews         |
| Persona 1 — M Review        | One-to-Many| A persona receives multiple reviews       |
| Reservation 1 — 1 Review    | One-to-One | One review per completed reservation      |

---

# Indexing Strategy

| Table         | Index Column(s)          | Purpose                          |
|---------------|--------------------------|----------------------------------|
| User          | email                    | Fast login lookups               |
| Persona       | userId                   | Profile lookups                  |
| PersonaSkill  | personaId, skillId       | Skill filtering                  |
| Availability  | personaId, startTime     | Availability queries             |
| Reservation   | userId, status           | User booking history             |
| Reservation   | personaId, status        | Persona booking management       |
| Review        | personaId                | Persona ratings                  |
| Notification  | userId, isRead           | Notification feeds               |

---

# Future Additions

The following entities are planned for future phases:

- Payment
- Transaction
- Message / Chat
- Session (video consultation)
- Calendar Integration

---