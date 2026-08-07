# Entity Relationship Diagram (ERD)

This document describes the relationships between the core entities in the Persona database.

---

# Entity Relationship Overview

```
┌─────────────┐          ┌──────────────┐
│    User     │ 1       1│   Persona    │
│─────────────│──────────│──────────────│
│ id          │          │ id           │
│ email       │          │ userId (FK)  │
│ passwordHash│          │ headline     │
│ fullName    │          │ bio          │
│ avatarUrl   │          │ hourlyRate   │
│ role        │          │ rating       │
│ isVerified  │          │ ratingCount  │
│ createdAt   │          │ isVerified   │
│ updatedAt   │          │ createdAt    │
└─────────────┘          │ updatedAt    │
                         └──────────────┘
                              │ 1
                              │
                              │ M
                         ┌──────────────┐
                         │ Availability │
                         │──────────────│
                         │ id           │
                         │ personaId(FK)│
                         │ startTime    │
                         │ endTime      │
                         │ isBooked     │
                         └──────────────┘
                              │ 1
                              │
                              │ M
                         ┌──────────────┐
                         │ Reservation  │
                         │──────────────│
                         │ id           │
                         │ userId (FK)  │
                         │ personaId(FK)│
                         │ availabilityId(FK)│
                         │ status       │
                         │ notes        │
                         └──────────────┘
                              │ 1
                              │
                              │ 1
                         ┌──────────────┐
                         │   Review     │
                         │──────────────│
                         │ id           │
                         │ userId (FK)  │
                         │ personaId(FK)│
                         │ reservationId(FK)│
                         │ rating       │
                         │ comment      │
                         │ isApproved   │
                         └──────────────┘

┌─────────────┐     M ┌──────────────┐ M     ┌─────────────┐
│   Persona   │───────│ PersonaSkill │───────│    Skill    │
│─────────────│       │──────────────│       │─────────────│
│ id          │       │ personaId(FK)│       │ id          │
│             │       │ skillId (FK) │       │ name        │
│             │       │ level        │       │ category    │
└─────────────┘       └──────────────┘       └─────────────┘

┌─────────────┐
│ Notification│
│─────────────│
│ id          │
│ userId (FK) │
│ type        │
│ title       │
│ body        │
│ isRead      │
└─────────────┘
```

---

# Cardinality Summary

| From Entity   | Relationship | To Entity     | Cardinality | Description                          |
|---------------|--------------|---------------|-------------|--------------------------------------|
| User          | owns         | Persona       | 1 : 1       | A user may have one persona profile  |
| Persona       | has          | Availability  | 1 : M       | A persona has many availability slots|
| User          | makes        | Reservation   | 1 : M       | A user can make many bookings        |
| Persona       | receives     | Reservation   | 1 : M       | A persona receives many bookings     |
| Availability  | linked to    | Reservation   | 1 : 1       | A slot is linked to one reservation  |
| User          | writes       | Review        | 1 : M       | A user can write many reviews        |
| Persona       | receives     | Review        | 1 : M       | A persona receives many reviews      |
| Reservation   | has          | Review        | 1 : 1       | One review per completed reservation |
| Persona       | has          | Skill         | M : N       | Via PersonaSkill junction table      |
| User          | receives     | Notification  | 1 : M       | A user receives many notifications   |

---

# Key Relationships

## User → Persona (1:1)

A registered user may create a professional persona profile. This is a one-to-one relationship where the `Persona.userId` references `User.id`.

## Persona → Skill (M:N)

A persona can have multiple skills, and a skill can belong to multiple personas. This many-to-many relationship is resolved through the `PersonaSkill` junction table.

## Persona → Availability (1:M)

A persona defines multiple availability slots. Each slot represents a time range during which the persona is available for consultation.

## Availability → Reservation (1:1)

When a user books a consultation, an availability slot is linked to a reservation. Once booked, the slot's `isBooked` flag is set to `true`.

## User → Reservation (1:M)

A user can create multiple reservations across different personas.

## Reservation → Review (1:1)

After a reservation is completed, the user may leave a review. Each reservation can have at most one review.

---

# Referential Integrity

- All foreign keys enforce `ON DELETE CASCADE` to maintain data consistency.
- Deleting a `User` removes their `Persona`, `Reservations`, `Reviews`, and `Notifications`.
- Deleting a `Persona` removes their `Availability` slots and `PersonaSkill` entries.
- Deleting an `Availability` removes the linked `Reservation`.

---

# Future Entities

The following entities will be added in future phases:

- **Payment** — linked to `Reservation`
- **Transaction** — payment history
- **Message** — chat between user and persona
- **Session** — video consultation metadata
- **CalendarIntegration** — external calendar sync

---