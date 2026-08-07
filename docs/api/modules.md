# Backend Modules

Persona's backend is built with **NestJS** and follows a modular architecture. Each domain is implemented as an independent module.

---

# Module Overview

| Module          | Responsibility                                      |
|-----------------|-----------------------------------------------------|
| AuthModule      | Registration, login, JWT issuance, token refresh    |
| UsersModule     | User profile management                             |
| PersonasModule  | Persona profiles, verification, search              |
| SkillsModule    | Skill catalog and persona-skill associations        |
| AvailabilityModule | Availability slot management                     |
| ReservationsModule | Booking creation, confirmation, cancellation     |
| ReviewsModule   | Review creation, moderation, ratings                |
| NotificationsModule | In-app notification delivery                    |
| CommonModule    | Shared utilities, guards, interceptors, filters     |
| ConfigModule    | Environment configuration                           |

---

# AuthModule

Handles authentication and authorization.

**Controllers:**

- `AuthController` — register, login, refresh, logout

**Services:**

- `AuthService` — core authentication logic
- `JwtService` — token generation and validation
- `BcryptService` — password hashing

**Guards:**

- `JwtAuthGuard` — protects authenticated routes
- `RolesGuard` — role-based access control

---

# UsersModule

Manages user accounts and profiles.

**Controllers:**

- `UsersController` — CRUD operations for users

**Services:**

- `UsersService` — user business logic
- `ProfileService` — profile management

---

# PersonasModule

Manages professional persona profiles.

**Controllers:**

- `PersonasController` — CRUD, search, verification

**Services:**

- `PersonasService` — persona business logic
- `PersonaSearchService` — search and filtering

---

# SkillsModule

Manages the skill catalog.

**Controllers:**

- `SkillsController` — CRUD for skills

**Services:**

- `SkillsService` — skill business logic

---

# AvailabilityModule

Manages persona availability slots.

**Controllers:**

- `AvailabilityController` — CRUD for availability

**Services:**

- `AvailabilityService` — slot management and conflict detection

---

# ReservationsModule

Manages consultation bookings.

**Controllers:**

- `ReservationsController` — create, list, update, cancel

**Services:**

- `ReservationsService` — booking business logic
- `BookingConflictService` — slot conflict validation

---

# ReviewsModule

Manages reviews and ratings.

**Controllers:**

- `ReviewsController` — create, list, moderate

**Services:**

- `ReviewsService` — review business logic
- `RatingService` — rating aggregation

---

# NotificationsModule

Delivers in-app notifications.

**Controllers:**

- `NotificationsController` — list, mark read

**Services:**

- `NotificationsService` — notification creation and delivery

---

# CommonModule

Shared infrastructure.

**Guards:**

- `JwtAuthGuard`
- `RolesGuard`

**Decorators:**

- `@Roles()`
- `@CurrentUser()`

**Interceptors:**

- `TransformInterceptor`
- `LoggingInterceptor`

**Filters:**

- `HttpExceptionFilter`
- `PrismaExceptionFilter`

**Pipes:**

- `ValidationPipe`

---

# ConfigModule

Centralized environment configuration.

**Providers:**

- `ConfigService` — typed environment access
- `DatabaseConfig`
- `JwtConfig`
- `CorsConfig`

---

# Module Dependencies

```
AuthModule
  └── UsersModule

UsersModule
  └── PrismaModule

PersonasModule
  ├── UsersModule
  └── SkillsModule

AvailabilityModule
  └── PersonasModule

ReservationsModule
  ├── UsersModule
  ├── PersonasModule
  └── AvailabilityModule

ReviewsModule
  ├── UsersModule
  ├── PersonasModule
  └── ReservationsModule

NotificationsModule
  └── UsersModule
```

---

# Future Modules

- PaymentsModule
- MessagesModule
- SessionsModule
- CalendarModule

---