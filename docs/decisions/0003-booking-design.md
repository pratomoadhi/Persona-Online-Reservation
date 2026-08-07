# ADR 0003: Booking Design

- **Status:** Accepted
- **Date:** 2026-01-03
- **Deciders:** Project Team

---

# Context

Persona's core feature is the ability for users to book consultation sessions with professionals. The booking system must support:

- Real-time availability management
- Conflict prevention (no double-booking)
- Status tracking (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- Notifications for both parties
- Future support for payments and calendar sync

The team needed to design a booking model that is simple, reliable, and scalable.

---

# Decision

Use a **slot-based availability model** with a **reservation lifecycle**.

## Availability Model

- Personas define discrete time slots (`Availability` table)
- Each slot has a start time, end time, and booked status
- Slots are created by the persona
- A slot can only be booked once

## Reservation Lifecycle

```
PENDING ──► CONFIRMED ──► COMPLETED
   │            │
   └──► CANCELLED ◄──────┘
```

### Status Definitions

| Status    | Description                                    |
|-----------|------------------------------------------------|
| PENDING   | User requested, awaiting persona confirmation  |
| CONFIRMED | Persona approved the booking                   |
| COMPLETED | Consultation session has finished              |
| CANCELLED | Booking was cancelled by either party          |

## Booking Flow

1. User selects an available slot
2. System creates a `PENDING` reservation
3. System marks the slot as booked (`isBooked = true`)
4. Persona is notified
5. Persona confirms or cancels
6. System updates the reservation status
7. User is notified

---

# Alternatives Considered

## Calendar-Based Scheduling

| Aspect          | Calendar-Based | Slot-Based (Chosen) |
|-----------------|----------------|---------------------|
| Complexity      | High           | Low                 |
| Conflict Handling | Complex     | Simple (one slot = one booking) |
| User Experience | Flexible       | Clear, predictable  |
| Implementation  | Requires calendar library | Simple CRUD |

**Reason Rejected:** Calendar-based scheduling adds significant complexity for the initial launch. Slot-based is simpler and sufficient for the current scope.

## Direct Booking (No Confirmation)

**Reason Rejected:** Personas need control over their schedule. A confirmation step prevents unwanted bookings.

## Waitlist System

**Reason Rejected:** Adds complexity without clear benefit for the initial version.

---

# Consequences

## Positive

- Simple and predictable booking flow
- Easy conflict prevention
- Clear status tracking
- Straightforward database model
- Easy to extend with payments and calendar sync

## Negative

- Less flexible than calendar-based scheduling
- Slots must be manually created by personas
- No recurring availability patterns (future enhancement)

## Neutral

- Requires careful handling of concurrent booking requests
- Slot cleanup for past availability is needed

---

# Concurrency Handling

To prevent double-booking under concurrent requests:

- Use a **transactional update** that checks `isBooked = false` before booking
- Use a **unique constraint** on `(availabilityId)` in the Reservation table
- Retry logic for failed transactions

---

# Future Enhancements

- Recurring availability patterns
- Buffer time between slots
- Payment integration at booking time
- Calendar sync (Google, Outlook)
- Video consultation links
- Rescheduling flow

---