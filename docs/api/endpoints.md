# REST API Endpoints

Persona exposes a **REST API** documented with **Swagger (OpenAPI)**.

Base URL: `/api/v1`

---

# Authentication

## Register

`POST /auth/register`

Creates a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "USER"
}
```

---

## Login

`POST /auth/login`

Authenticates a user and returns tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`

```json
{
  "accessToken": "jwt-token",
  "refreshToken": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "USER"
  }
}
```

---

## Refresh Token

`POST /auth/refresh`

**Request Body:**

```json
{
  "refreshToken": "jwt-token"
}
```

**Response:** `200 OK`

```json
{
  "accessToken": "new-jwt-token"
}
```

---

## Logout

`POST /auth/logout`

**Request Body:**

```json
{
  "refreshToken": "jwt-token"
}
```

**Response:** `200 OK`

---

# Users

## Get Current User

`GET /users/me`

**Auth:** Bearer token required

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "avatarUrl": null,
  "role": "USER",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

## Update Current User

`PATCH /users/me`

**Auth:** Bearer token required

**Request Body:**

```json
{
  "fullName": "John Smith",
  "avatarUrl": "https://example.com/avatar.png"
}
```

**Response:** `200 OK`

---

# Personas

## List Personas

`GET /personas`

**Query Parameters:**

| Parameter | Type    | Description                    |
|-----------|---------|--------------------------------|
| search    | string  | Search by name or headline     |
| skill     | string  | Filter by skill                |
| page      | number  | Page number (default: 1)       |
| limit     | number  | Items per page (default: 10)   |

**Response:** `200 OK`

```json
{
  "items": [
    {
      "id": "uuid",
      "headline": "Senior Software Engineer",
      "bio": "10+ years of experience",
      "rating": 4.8,
      "ratingCount": 25,
      "skills": ["TypeScript", "NestJS"]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

## Get Persona by ID

`GET /personas/:id`

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "headline": "Senior Software Engineer",
  "bio": "10+ years of experience",
  "hourlyRate": 50,
  "rating": 4.8,
  "ratingCount": 25,
  "isVerified": true,
  "skills": ["TypeScript", "NestJS"],
  "availability": [
    {
      "id": "uuid",
      "startTime": "2026-01-10T09:00:00Z",
      "endTime": "2026-01-10T10:00:00Z",
      "isBooked": false
    }
  ]
}
```

---

## Create Persona

`POST /personas`

**Auth:** Bearer token required (USER)

**Request Body:**

```json
{
  "headline": "Senior Software Engineer",
  "bio": "10+ years of experience",
  "hourlyRate": 50,
  "skillIds": ["uuid1", "uuid2"]
}
```

**Response:** `201 Created`

---

## Update Persona

`PATCH /personas/:id`

**Auth:** Bearer token required (owner or ADMIN)

**Request Body:**

```json
{
  "headline": "Lead Software Engineer",
  "bio": "Updated bio"
}
```

**Response:** `200 OK`

---

## Delete Persona

`DELETE /personas/:id`

**Auth:** Bearer token required (owner or ADMIN)

**Response:** `204 No Content`

---

# Skills

## List Skills

`GET /skills`

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "name": "TypeScript",
    "category": "Programming"
  }
]
```

---

## Create Skill

`POST /skills`

**Auth:** Bearer token required (ADMIN)

**Request Body:**

```json
{
  "name": "TypeScript",
  "category": "Programming"
}
```

**Response:** `201 Created`

---

# Availability

## List Availability for Persona

`GET /personas/:personaId/availability`

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "startTime": "2026-01-10T09:00:00Z",
    "endTime": "2026-01-10T10:00:00Z",
    "isBooked": false
  }
]
```

---

## Create Availability Slot

`POST /personas/:personaId/availability`

**Auth:** Bearer token required (persona owner)

**Request Body:**

```json
{
  "startTime": "2026-01-10T09:00:00Z",
  "endTime": "2026-01-10T10:00:00Z"
}
```

**Response:** `201 Created`

---

## Delete Availability Slot

`DELETE /availability/:id`

**Auth:** Bearer token required (persona owner)

**Response:** `204 No Content`

---

# Reservations

## Create Reservation

`POST /reservations`

**Auth:** Bearer token required

**Request Body:**

```json
{
  "personaId": "uuid",
  "availabilityId": "uuid",
  "notes": "Looking forward to the session"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "status": "PENDING",
  "personaId": "uuid",
  "availabilityId": "uuid",
  "createdAt": "2026-01-05T00:00:00Z"
}
```

---

## List My Reservations

`GET /reservations/me`

**Auth:** Bearer token required

**Query Parameters:**

| Parameter | Type   | Description                          |
|-----------|--------|--------------------------------------|
| status    | string | Filter: PENDING, CONFIRMED, COMPLETED, CANCELLED |
| page      | number | Page number                          |
| limit     | number | Items per page                       |

**Response:** `200 OK`

---

## Get Reservation by ID

`GET /reservations/:id`

**Auth:** Bearer token required (participant or ADMIN)

**Response:** `200 OK`

---

## Update Reservation Status

`PATCH /reservations/:id/status`

**Auth:** Bearer token required (persona owner or ADMIN)

**Request Body:**

```json
{
  "status": "CONFIRMED"
}
```

**Response:** `200 OK`

---

## Cancel Reservation

`PATCH /reservations/:id/cancel`

**Auth:** Bearer token required (participant or ADMIN)

**Response:** `200 OK`

---

# Reviews

## Create Review

`POST /reviews`

**Auth:** Bearer token required

**Request Body:**

```json
{
  "personaId": "uuid",
  "reservationId": "uuid",
  "rating": 5,
  "comment": "Excellent consultation!"
}
```

**Response:** `201 Created`

---

## List Reviews for Persona

`GET /personas/:personaId/reviews`

**Response:** `200 OK`

```json
{
  "items": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Excellent consultation!",
      "userName": "John Doe",
      "createdAt": "2026-01-06T00:00:00Z"
    }
  ],
  "averageRating": 4.8,
  "total": 1
}
```

---

## Moderate Review

`PATCH /reviews/:id/moderate`

**Auth:** Bearer token required (ADMIN)

**Request Body:**

```json
{
  "isApproved": true
}
```

**Response:** `200 OK`

---

# Notifications

## List My Notifications

`GET /notifications/me`

**Auth:** Bearer token required

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "type": "BOOKING",
    "title": "New booking request",
    "body": "John Doe requested a consultation",
    "isRead": false,
    "createdAt": "2026-01-05T00:00:00Z"
  }
]
```

---

## Mark Notification as Read

`PATCH /notifications/:id/read`

**Auth:** Bearer token required

**Response:** `200 OK`

---

# Error Response Format

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

---

# HTTP Status Codes

| Status | Description                          |
|--------|--------------------------------------|
| 200    | Success                              |
| 201    | Created                              |
| 204    | No Content                           |
| 400    | Bad Request / Validation Error       |
| 401    | Unauthorized                         |
| 403    | Forbidden                            |
| 404    | Not Found                            |
| 409    | Conflict                             |
| 500    | Internal Server Error                |

---