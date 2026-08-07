# User Flows

This document describes the key user journeys in the Persona application.

---

# Flow 1: Guest Browsing

## Description

A guest discovers and explores personas without creating an account.

## Steps

1. Guest visits the landing page
2. Guest searches for a skill or category
3. Guest browses the persona list
4. Guest views a persona profile
5. Guest views availability and reviews
6. Guest attempts to book → redirected to login

## Diagram

```
Landing Page
    │
    ▼
Search / Browse
    │
    ▼
Persona List
    │
    ▼
Persona Profile
    │
    ├──► View Availability
    │
    ├──► View Reviews
    │
    └──► Book Consultation
            │
            ▼
        Login Required
```

---

# Flow 2: User Registration

## Description

A guest creates a new account.

## Steps

1. Guest clicks "Sign Up"
2. Guest fills in full name, email, and password
3. System validates input
4. System creates the account
5. System logs the user in
6. User is redirected to the dashboard

## Validation Rules

- Email must be valid and unique
- Password must be at least 8 characters
- Full name is required

## Error States

- Email already exists
- Invalid email format
- Password too short

---

# Flow 3: User Login

## Description

A registered user logs into their account.

## Steps

1. User clicks "Login"
2. User enters email and password
3. System validates credentials
4. System issues JWT tokens
5. User is redirected to their dashboard

## Error States

- Invalid email or password
- Account not verified

---

# Flow 4: Booking a Consultation

## Description

A user books a consultation with a persona.

## Steps

1. User views a persona profile
2. User selects an available time slot
3. User clicks "Book Consultation"
4. Booking modal opens with slot details
5. User optionally adds notes
6. User confirms the booking
7. System creates a PENDING reservation
8. System marks the slot as booked
9. System notifies the persona
10. User sees a success confirmation

## Business Rules

- A slot can only be booked once
- A user cannot book their own persona
- Past slots cannot be booked
- Booking requires authentication

## Diagram

```
Persona Profile
    │
    ▼
Select Availability Slot
    │
    ▼
Booking Modal
    │
    ├──► Add Notes (optional)
    │
    ▼
Confirm Booking
    │
    ▼
Reservation Created (PENDING)
    │
    ├──► Slot Marked as Booked
    │
    └──► Persona Notified
```

---

# Flow 5: Persona Managing Bookings

## Description

A persona reviews and manages incoming booking requests.

## Steps

1. Persona logs in
2. Persona views dashboard
3. Persona sees incoming requests
4. Persona approves or rejects a request
5. System updates the reservation status
6. System notifies the user

## Status Transitions

```
PENDING ──► CONFIRMED
PENDING ──► CANCELLED
CONFIRMED ──► COMPLETED
CONFIRMED ──► CANCELLED
```

---

# Flow 6: Persona Managing Availability

## Description

A persona creates and manages their availability slots.

## Steps

1. Persona logs in
2. Persona navigates to "Manage Availability"
3. Persona clicks "Add Availability Slot"
4. Persona selects date and time range
5. System validates no conflicts
6. Persona saves the slot
7. Slot appears in the availability list

## Validation Rules

- End time must be after start time
- No overlapping slots allowed
- Slots cannot be in the past

---

# Flow 7: Leaving a Review

## Description

A user leaves a review after a completed consultation.

## Steps

1. User views their completed booking
2. User clicks "Leave Review"
3. Review form opens
4. User selects a star rating (1-5)
5. User optionally writes a comment
6. User submits the review
7. System creates the review (pending approval)
8. System updates the persona's average rating

## Business Rules

- Only the booking user can review
- Only completed reservations can be reviewed
- One review per reservation
- Reviews require admin approval before public display

---

# Flow 8: Admin Verification

## Description

An admin verifies persona profiles.

## Steps

1. Admin logs in
2. Admin navigates to the admin dashboard
3. Admin sees pending verifications
4. Admin reviews the persona profile
5. Admin approves or rejects
6. System updates the persona's verified status
7. System notifies the persona

---

# Flow 9: Admin Review Moderation

## Description

An admin moderates user reviews.

## Steps

1. Admin logs in
2. Admin navigates to review moderation
3. Admin sees pending reviews
4. Admin reviews the content
5. Admin approves or removes the review
6. System updates the review status
7. System updates the persona's rating if removed

---

# Flow 10: Notifications

## Description

Users receive in-app notifications for important events.

## Notification Events

| Event                    | Recipient | Type    |
|--------------------------|-----------|---------|
| New booking request      | Persona   | BOOKING |
| Booking confirmed        | User      | BOOKING |
| Booking cancelled        | Both      | BOOKING |
| Booking completed        | Both      | BOOKING |
| New review received      | Persona   | SYSTEM  |
| Profile verified         | Persona   | SYSTEM  |
| Review approved          | User      | SYSTEM  |

## Steps

1. An event occurs in the system
2. System creates a notification record
3. Notification appears in the user's notification feed
4. User sees an unread indicator
5. User marks the notification as read

---

# Flow 11: Becoming a Persona

## Description

A user creates a professional persona profile.

## Steps

1. User logs in
2. User navigates to "Become a Persona"
3. User fills in headline and bio
4. User selects skills
5. User optionally sets an hourly rate
6. User submits the profile
7. System creates the persona (unverified)
8. Admin reviews and verifies the profile
9. User is notified of verification

---

# Flow 12: Search and Filter

## Description

A user searches for personas by skill or keyword.

## Steps

1. User enters a search term
2. User optionally applies category filters
3. System queries the persona list
4. Results are displayed with pagination
5. User clicks a persona to view details

## Search Parameters

- Keyword (name, headline, bio)
- Skill
- Category
- Rating (minimum)
- Verified only

---

# Error Handling

## Common Error States

| Scenario                    | User Experience                          |
|-----------------------------|------------------------------------------|
| Network failure             | Retry message with "Try Again" button    |
| Validation error            | Inline field errors                      |
| Unauthorized access         | Redirect to login                        |
| Forbidden action            | "You don't have permission" message      |
| Not found                   | 404 page with link back home             |
| Server error                | Generic error with support contact       |

## Loading States

- Skeleton loaders for lists and profiles
- Spinner on buttons during submission
- Progress indicators for multi-step flows

---

# Empty States

| Scenario                    | Empty State Message                      |
|-----------------------------|------------------------------------------|
| No search results           | "No personas found. Try different keywords." |
| No bookings                 | "You have no bookings yet. Browse personas." |
| No availability             | "No available slots. Check back later."  |
| No notifications            | "You're all caught up!"                  |
| No reviews                  | "No reviews yet. Be the first to review." |

---