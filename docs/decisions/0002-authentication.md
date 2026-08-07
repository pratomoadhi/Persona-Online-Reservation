# ADR 0002: Authentication Strategy

- **Status:** Accepted
- **Date:** 2026-01-02
- **Deciders:** Project Team

---

# Context

Persona requires secure authentication for:

- User registration and login
- Role-based access control (USER, PERSONA, ADMIN)
- Protecting booking and profile management endpoints
- Future support for OAuth and 2FA

The team needed to choose an authentication approach that is secure, simple to implement, and scalable.

---

# Decision

Use **JWT (JSON Web Tokens)** for authentication with **bcrypt** for password hashing.

## Token Strategy

- **Access Token:** Short-lived (15 minutes), stored in memory
- **Refresh Token:** Long-lived (7 days), stored in HTTP-only cookie
- **Token Rotation:** Refresh tokens are rotated on each use

## Password Hashing

- **Algorithm:** bcrypt
- **Salt Rounds:** 10

## Authorization

- **JwtAuthGuard** — validates access tokens
- **RolesGuard** — enforces role-based access control
- **@Roles()** decorator — declares required roles

---

# Alternatives Considered

## Session-Based Authentication

| Aspect       | Session-Based | JWT (Chosen) |
|--------------|---------------|--------------|
| State        | Server-side   | Stateless    |
| Scalability  | Requires shared session store | Scales horizontally |
| Complexity   | Simpler       | Moderate     |
| Mobile Support | Requires cookie handling | Works with headers |

**Reason Rejected:** Session-based auth requires server-side state management, making horizontal scaling more complex.

## OAuth2 Only

**Reason Rejected:** Adds complexity for the initial launch. Planned as a future enhancement.

## Firebase Auth

**Reason Rejected:** Vendor lock-in and less control over the authentication flow.

---

# Consequences

## Positive

- Stateless authentication scales horizontally
- Simple to implement with NestJS guards
- Works well with mobile and web clients
- Refresh token rotation improves security
- Role-based access control is straightforward

## Negative

- Token revocation is complex (requires a blacklist)
- JWT size can grow with claims
- Requires careful secret management

## Neutral

- Refresh token storage requires secure cookie configuration
- Token lifetime tuning may be needed based on usage patterns

---

# Security Considerations

- JWT secrets stored in environment variables
- HTTPS required in production
- Rate limiting on auth endpoints
- Helmet for security headers
- CORS restricted to allowed origins

---

# Future Enhancements

- Email verification
- Password reset flow
- OAuth2 (Google, GitHub)
- Two-factor authentication (2FA)
- Session management dashboard

---