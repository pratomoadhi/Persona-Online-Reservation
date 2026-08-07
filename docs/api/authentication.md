# Authentication

Persona uses **JWT (JSON Web Tokens)** for authentication and **bcrypt** for password hashing.

---

# Authentication Flow

## Registration

1. User submits `email`, `password`, and `fullName`
2. Backend validates input with `class-validator`
3. Password is hashed with `bcrypt`
4. User record is created with role `USER`
5. A verification email is sent (future)
6. Returns success response

## Login

1. User submits `email` and `password`
2. Backend verifies credentials
3. If valid, generates an access token and refresh token
4. Returns tokens and user profile

## Token Refresh

1. Client sends the refresh token
2. Backend validates the refresh token
3. Issues a new access token
4. Optionally rotates the refresh token

## Logout

1. Client sends the refresh token
2. Backend revokes the token
3. Client discards stored tokens

---

# Token Structure

## Access Token

- **Type:** JWT
- **Lifetime:** 15 minutes
- **Storage:** Memory (client-side)
- **Purpose:** Authorize API requests

## Refresh Token

- **Type:** JWT
- **Lifetime:** 7 days
- **Storage:** HTTP-only cookie
- **Purpose:** Obtain new access tokens

---

# JWT Payload

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1730000000,
  "exp": 1730000900
}
```

---

# Password Hashing

- Algorithm: **bcrypt**
- Salt rounds: **10**
- Stored as: `passwordHash` in the `User` table
- Plain passwords are never stored

---

# Authorization

## Roles

| Role     | Description                          |
|----------|--------------------------------------|
| USER     | Registered customer                  |
| PERSONA  | Professional providing consultation  |
| ADMIN    | Platform administrator               |

## Role-Based Access Control

Routes are protected using guards:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
```

---

# Protected Routes

| Route Group        | Access                          |
|--------------------|---------------------------------|
| `/auth/*`          | Public (register, login)        |
| `/users/*`         | Authenticated users             |
| `/personas/*`      | Public read, authenticated write|
| `/availability/*`  | Persona owners                  |
| `/reservations/*`  | Authenticated users             |
| `/reviews/*`       | Authenticated users             |
| `/notifications/*` | Authenticated users             |
| `/admin/*`         | ADMIN only                      |

---

# Security Headers

- `helmet` for security headers
- CORS configured for allowed origins
- Rate limiting on auth endpoints

---

# Error Responses

| Status | Code            | Description                    |
|--------|-----------------|--------------------------------|
| 400    | VALIDATION_ERROR| Invalid input                  |
| 401    | UNAUTHORIZED    | Missing or invalid token       |
| 403    | FORBIDDEN       | Insufficient role              |
| 409    | EMAIL_EXISTS    | Email already registered       |

---

# Future Enhancements

- Email verification
- Password reset
- OAuth2 (Google, GitHub)
- Two-factor authentication (2FA)
- Session management dashboard

---