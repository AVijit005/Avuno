# Authentication & Authorization

<cite>
**Referenced Files in This Document**
- [auth.module.ts](file://apps/backend/src/auth/auth.module.ts)
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [auth.repository.ts](file://apps/backend/src/auth/auth.repository.ts)
- [index.ts](file://apps/backend/src/auth/index.ts)
- [controllers/auth.controller.ts](file://apps/backend/src/auth/controllers/auth.controller.ts)
- [controllers/oauth.controller.ts](file://apps/backend/src/auth/controllers/oauth.controller.ts)
- [controllers/email.controller.ts](file://apps/backend/src/auth/controllers/email.controller.ts)
- [guards/jwt.guard.ts](file://apps/backend/src/auth/guards/jwt.guard.ts)
- [guards/roles.guard.ts](file://apps/backend/src/auth/guards/roles.guard.ts)
- [decorators/current-user.decorator.ts](file://apps/backend/src/auth/decorators/current-user.decorator.ts)
- [decorators/roles.decorator.ts](file://apps/backend/src/auth/decorators/roles.decorator.ts)
- [strategies/jwt.strategy.ts](file://apps/backend/src/auth/strategies/jwt.strategy.ts)
- [strategies/google.strategy.ts](file://apps/backend/src/auth/strategies/google.strategy.ts)
- [dto/login.dto.ts](file://apps/backend/src/auth/dto/login.dto.ts)
- [dto/register.dto.ts](file://apps/backend/src/auth/dto/register.dto.ts)
- [dto/reset-password.dto.ts](file://apps/backend/src/auth/dto/reset-password.dto.ts)
- [dto/refresh-token.dto.ts](file://apps/backend/src/auth/dto/refresh-token.dto.ts)
- [services/user.service.ts](file://apps/backend/src/auth/services/user.service.ts)
- [services/token.service.ts](file://apps/backend/src/auth/services/token.service.ts)
- [services/password.service.ts](file://apps/backend/src/auth/services/password.service.ts)
- [services/email.service.ts](file://apps/backend/src/auth/services/email.service.ts)
- [services/oauth.service.ts](file://apps/backend/src/auth/services/oauth.service.ts)
- [services/session.service.ts](file://apps/backend/src/auth/services/session.service.ts)
- [services/rate-limit.service.ts](file://apps/backend/src/auth/services/rate-limit.service.ts)
- [services/csrf.service.ts](file://apps/backend/src/auth/services/csrf.service.ts)
- [core/hash/bcrypt.service.ts](file://apps/backend/src/core/hash/bcrypt.service.ts)
- [core/events/event-emitter.service.ts](file://apps/backend/src/core/events/event-emitter.service.ts)
- [config/configuration.ts](file://apps/backend/src/config/configuration.ts)
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [main.ts](file://apps/backend/src/main.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document explains the authentication and authorization system implemented in the backend module. It covers JWT token lifecycle, role-based access control (RBAC), OAuth integration with Google, email verification workflows, session handling, and security hardening measures such as password hashing, rate limiting, and CSRF protection. It also documents all authentication endpoints, protected route patterns, guard usage, custom decorators, roles and permissions, and audit logging for security events.

## Project Structure
The authentication subsystem is organized under apps/backend/src/auth with clear separation of concerns:
- Controllers expose HTTP endpoints for login, registration, password reset, refresh tokens, and OAuth flows.
- Guards enforce authentication and authorization at route level.
- Decorators inject user context and role metadata into controllers.
- Strategies implement Passport strategies for JWT and Google OAuth.
- Services encapsulate business logic for users, tokens, passwords, email, OAuth, sessions, and rate limiting.
- Repositories handle data persistence for auth-related entities.
- DTOs define request/response validation schemas.

```mermaid
graph TB
subgraph "Auth Module"
AC["auth.controller.ts"]
OC["controllers/oauth.controller.ts"]
EC["controllers/email.controller.ts"]
JG["guards/jwt.guard.ts"]
RG["guards/roles.guard.ts"]
CU["decorators/current-user.decorator.ts"]
RD["decorators/roles.decorator.ts"]
JS["strategies/jwt.strategy.ts"]
GS["strategies/google.strategy.ts"]
AS["auth.service.ts"]
US["services/user.service.ts"]
TS["services/token.service.ts"]
PS["services/password.service.ts"]
ES["services/email.service.ts"]
OS["services/oauth.service.ts"]
SS["services/session.service.ts"]
RL["services/rate-limit.service.ts"]
CS["services/csrf.service.ts"]
end
AC --> AS
OC --> OS
EC --> ES
JG --> JS
RG --> RD
AS --> US
AS --> TS
AS --> PS
AS --> ES
AS --> SS
AS --> RL
AS --> CS
OS --> GS
```

**Diagram sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [controllers/oauth.controller.ts](file://apps/backend/src/auth/controllers/oauth.controller.ts)
- [controllers/email.controller.ts](file://apps/backend/src/auth/controllers/email.controller.ts)
- [guards/jwt.guard.ts](file://apps/backend/src/auth/guards/jwt.guard.ts)
- [guards/roles.guard.ts](file://apps/backend/src/auth/guards/roles.guard.ts)
- [decorators/current-user.decorator.ts](file://apps/backend/src/auth/decorators/current-user.decorator.ts)
- [decorators/roles.decorator.ts](file://apps/backend/src/auth/decorators/roles.decorator.ts)
- [strategies/jwt.strategy.ts](file://apps/backend/src/auth/strategies/jwt.strategy.ts)
- [strategies/google.strategy.ts](file://apps/backend/src/auth/strategies/google.strategy.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [services/user.service.ts](file://apps/backend/src/auth/services/user.service.ts)
- [services/token.service.ts](file://apps/backend/src/auth/services/token.service.ts)
- [services/password.service.ts](file://apps/backend/src/auth/services/password.service.ts)
- [services/email.service.ts](file://apps/backend/src/auth/services/email.service.ts)
- [services/oauth.service.ts](file://apps/backend/src/auth/services/oauth.service.ts)
- [services/session.service.ts](file://apps/backend/src/auth/services/session.service.ts)
- [services/rate-limit.service.ts](file://apps/backend/src/auth/services/rate-limit.service.ts)
- [services/csrf.service.ts](file://apps/backend/src/auth/services/csrf.service.ts)

**Section sources**
- [auth.module.ts](file://apps/backend/src/auth/auth.module.ts)
- [index.ts](file://apps/backend/src/auth/index.ts)

## Core Components
- Controllers:
  - Auth controller exposes login, register, password reset, and token refresh endpoints.
  - OAuth controller handles Google OAuth callbacks and token exchange.
  - Email controller manages verification link generation and confirmation.
- Guards:
  - JWT guard validates bearer tokens using Passport strategy.
  - Roles guard enforces RBAC by checking user roles against allowed values.
- Decorators:
  - Current user decorator extracts authenticated user from request context.
  - Roles decorator declares required roles for a route.
- Strategies:
  - JWT strategy validates and deserializes tokens to attach user to request.
  - Google strategy integrates with Google OAuth provider for sign-in/sign-up.
- Services:
  - User service manages user creation, lookup, and profile updates.
  - Token service issues and verifies JWTs and refresh tokens.
  - Password service hashes and compares passwords securely.
  - Email service sends verification and reset emails.
  - OAuth service orchestrates Google OAuth flow and user provisioning.
  - Session service manages server-side sessions if used alongside JWT.
  - Rate limit service throttles sensitive endpoints.
  - CSRF service generates and validates CSRF tokens for state-changing requests.
- Repositories:
  - Persist users, tokens, sessions, and audit logs.

Security highlights:
- Password hashing via bcrypt-compatible implementation.
- Rate limiting on login, registration, and password reset.
- CSRF protection for forms and token exchanges.
- Secure cookie configuration for refresh tokens when applicable.

**Section sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [controllers/oauth.controller.ts](file://apps/backend/src/auth/controllers/oauth.controller.ts)
- [controllers/email.controller.ts](file://apps/backend/src/auth/controllers/email.controller.ts)
- [guards/jwt.guard.ts](file://apps/backend/src/auth/guards/jwt.guard.ts)
- [guards/roles.guard.ts](file://apps/backend/src/auth/guards/roles.guard.ts)
- [decorators/current-user.decorator.ts](file://apps/backend/src/auth/decorators/current-user.decorator.ts)
- [decorators/roles.decorator.ts](file://apps/backend/src/auth/decorators/roles.decorator.ts)
- [strategies/jwt.strategy.ts](file://apps/backend/src/auth/strategies/jwt.strategy.ts)
- [strategies/google.strategy.ts](file://apps/backend/src/auth/strategies/google.strategy.ts)
- [services/user.service.ts](file://apps/backend/src/auth/services/user.service.ts)
- [services/token.service.ts](file://apps/backend/src/auth/services/token.service.ts)
- [services/password.service.ts](file://apps/backend/src/auth/services/password.service.ts)
- [services/email.service.ts](file://apps/backend/src/auth/services/email.service.ts)
- [services/oauth.service.ts](file://apps/backend/src/auth/services/oauth.service.ts)
- [services/session.service.ts](file://apps/backend/src/auth/services/session.service.ts)
- [services/rate-limit.service.ts](file://apps/backend/src/auth/services/rate-limit.service.ts)
- [services/csrf.service.ts](file://apps/backend/src/auth/services/csrf.service.ts)
- [core/hash/bcrypt.service.ts](file://apps/backend/src/core/hash/bcrypt.service.ts)

## Architecture Overview
The authentication architecture follows a layered approach:
- Entry points are NestJS controllers that validate inputs via DTOs.
- Controllers delegate to services for business logic.
- Services interact with repositories for persistence and external providers (Google).
- Guards and strategies integrate with Passport for request-level security.
- Security utilities provide hashing, rate limiting, and CSRF protection.
- Audit events are emitted for key security actions.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "AuthController"
participant Service as "AuthService"
participant TokenSvc as "TokenService"
participant UserSvc as "UserService"
participant EmailSvc as "EmailService"
participant Strategy as "JWTStrategy"
participant Guard as "JwtGuard"
Client->>Controller : POST /auth/login
Controller->>Service : validateCredentials()
Service->>UserSvc : findByEmail()
UserSvc-->>Service : user or null
Service->>Service : comparePassword()
Service->>TokenSvc : generateTokens(user)
TokenSvc-->>Service : {accessToken, refreshToken}
Service-->>Controller : tokens
Controller-->>Client : {accessToken, refreshToken}
Note over Client,Guard : Subsequent requests include Bearer token
Client->>Controller : GET /protected
Controller->>Guard : canActivate()
Guard->>Strategy : verify(token)
Strategy-->>Guard : user
Guard-->>Controller : allow
Controller-->>Client : response
```

**Diagram sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [services/token.service.ts](file://apps/backend/src/auth/services/token.service.ts)
- [services/user.service.ts](file://apps/backend/src/auth/services/user.service.ts)
- [services/email.service.ts](file://apps/backend/src/auth/services/email.service.ts)
- [strategies/jwt.strategy.ts](file://apps/backend/src/auth/strategies/jwt.strategy.ts)
- [guards/jwt.guard.ts](file://apps/backend/src/auth/guards/jwt.guard.ts)

## Detailed Component Analysis

### JWT Token Management
- Access tokens are short-lived and included in Authorization headers.
- Refresh tokens are long-lived and stored securely (cookie or server-side store).
- Token rotation can be supported by invalidating old refresh tokens upon use.
- Token payload includes minimal claims (e.g., user id, roles).

```mermaid
classDiagram
class TokenService {
+generateAccessToken(user) string
+generateRefreshToken(user) string
+verifyAccessToken(token) object
+verifyRefreshToken(token) object
+revokeRefreshToken(token) boolean
}
class JwtStrategy {
+validate(payload) object
}
class JwtGuard {
+canActivate(context) boolean
}
TokenService <.. JwtStrategy : "verifies"
JwtGuard --> JwtStrategy : "uses"
```

**Diagram sources**
- [services/token.service.ts](file://apps/backend/src/auth/services/token.service.ts)
- [strategies/jwt.strategy.ts](file://apps/backend/src/auth/strategies/jwt.strategy.ts)
- [guards/jwt.guard.ts](file://apps/backend/src/auth/guards/jwt.guard.ts)

**Section sources**
- [services/token.service.ts](file://apps/backend/src/auth/services/token.service.ts)
- [strategies/jwt.strategy.ts](file://apps/backend/src/auth/strategies/jwt.strategy.ts)
- [guards/jwt.guard.ts](file://apps/backend/src/auth/guards/jwt.guard.ts)

### Role-Based Access Control (RBAC)
- Roles are attached to user profiles and validated by the roles guard.
- Routes declare required roles via the roles decorator.
- The current user decorator provides access to the authenticated user’s roles.

```mermaid
flowchart TD
Start(["Request"]) --> CheckGuard["RolesGuard checks allowed roles"]
CheckGuard --> HasRole{"User has required role?"}
HasRole --> |Yes| Proceed["Proceed to handler"]
HasRole --> |No| Deny["Return 403 Forbidden"]
Proceed --> End(["Response"])
Deny --> End
```

**Diagram sources**
- [guards/roles.guard.ts](file://apps/backend/src/auth/guards/roles.guard.ts)
- [decorators/roles.decorator.ts](file://apps/backend/src/auth/decorators/roles.decorator.ts)
- [decorators/current-user.decorator.ts](file://apps/backend/src/auth/decorators/current-user.decorator.ts)

**Section sources**
- [guards/roles.guard.ts](file://apps/backend/src/auth/guards/roles.guard.ts)
- [decorators/roles.decorator.ts](file://apps/backend/src/auth/decorators/roles.decorator.ts)
- [decorators/current-user.decorator.ts](file://apps/backend/src/auth/decorators/current-user.decorator.ts)

### OAuth Integration with Google
- Google OAuth flow redirects users to Google for consent.
- On callback, the Google strategy validates the ID token and exchanges it for an access token.
- The OAuth service provisions or links the user account and returns JWT tokens.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "OAuthController"
participant Strategy as "GoogleStrategy"
participant Service as "OAuthService"
participant UserSvc as "UserService"
participant TokenSvc as "TokenService"
Client->>Controller : GET /auth/google
Controller->>Strategy : initiate()
Strategy-->>Client : redirect to Google
Client->>Controller : GET /auth/google/callback
Controller->>Strategy : validateCallback()
Strategy-->>Controller : profile
Controller->>Service : handleGoogleLogin(profile)
Service->>UserSvc : findOrCreateUser()
UserSvc-->>Service : user
Service->>TokenSvc : generateTokens(user)
TokenSvc-->>Service : {accessToken, refreshToken}
Service-->>Controller : tokens
Controller-->>Client : {accessToken, refreshToken}
```

**Diagram sources**
- [controllers/oauth.controller.ts](file://apps/backend/src/auth/controllers/oauth.controller.ts)
- [strategies/google.strategy.ts](file://apps/backend/src/auth/strategies/google.strategy.ts)
- [services/oauth.service.ts](file://apps/backend/src/auth/services/oauth.service.ts)
- [services/user.service.ts](file://apps/backend/src/auth/services/user.service.ts)
- [services/token.service.ts](file://apps/backend/src/auth/services/token.service.ts)

**Section sources**
- [controllers/oauth.controller.ts](file://apps/backend/src/auth/controllers/oauth.controller.ts)
- [strategies/google.strategy.ts](file://apps/backend/src/auth/strategies/google.strategy.ts)
- [services/oauth.service.ts](file://apps/backend/src/auth/services/oauth.service.ts)

### Email Verification Workflow
- Registration triggers sending a verification email with a secure token.
- Users click the link; the email controller validates the token and marks the user verified.
- Protected routes may require verified status.

```mermaid
flowchart TD
RegStart["Register user"] --> SendEmail["Send verification email"]
SendEmail --> WaitClick["User clicks verification link"]
WaitClick --> ValidateToken["Validate token and user"]
ValidateToken --> Verified{"Valid?"}
Verified --> |Yes| MarkVerified["Mark user as verified"]
Verified --> |No| Error["Return error"]
MarkVerified --> Done["Done"]
Error --> Done
```

**Diagram sources**
- [controllers/email.controller.ts](file://apps/backend/src/auth/controllers/email.controller.ts)
- [services/email.service.ts](file://apps/backend/src/auth/services/email.service.ts)
- [services/user.service.ts](file://apps/backend/src/auth/services/user.service.ts)

**Section sources**
- [controllers/email.controller.ts](file://apps/backend/src/auth/controllers/email.controller.ts)
- [services/email.service.ts](file://apps/backend/src/auth/services/email.service.ts)
- [services/user.service.ts](file://apps/backend/src/auth/services/user.service.ts)

### Session Handling
- Sessions can be used alongside JWT for additional state management.
- Session service manages creation, storage, and cleanup.
- Sensitive operations may require active session validation.

```mermaid
classDiagram
class SessionService {
+createSession(userId) string
+getSession(sessionId) object
+updateSession(sessionId, data) boolean
+deleteSession(sessionId) boolean
}
```

**Diagram sources**
- [services/session.service.ts](file://apps/backend/src/auth/services/session.service.ts)

**Section sources**
- [services/session.service.ts](file://apps/backend/src/auth/services/session.service.ts)

### Security Measures
- Password Hashing:
  - Use bcrypt-compatible hashing for storing passwords.
- Rate Limiting:
  - Apply per-IP and per-user limits on login, registration, and password reset.
- CSRF Protection:
  - Generate and validate CSRF tokens for state-changing endpoints.
- Secure Cookies:
  - Set HttpOnly, Secure, SameSite flags for refresh tokens.

```mermaid
flowchart TD
Request["Incoming Request"] --> CheckCSRF["Validate CSRF token"]
CheckCSRF --> ValidCSRF{"CSRF valid?"}
ValidCSRF --> |No| Reject["Reject request"]
ValidCSRF --> |Yes| CheckRate["Check rate limit"]
CheckRate --> WithinLimit{"Within limit?"}
WithinLimit --> |No| Throttle["Throttle request"]
WithinLimit --> |Yes| Process["Process request"]
Throttle --> End(["End"])
Reject --> End
Process --> End
```

**Diagram sources**
- [services/csrf.service.ts](file://apps/backend/src/auth/services/csrf.service.ts)
- [services/rate-limit.service.ts](file://apps/backend/src/auth/services/rate-limit.service.ts)
- [core/hash/bcrypt.service.ts](file://apps/backend/src/core/hash/bcrypt.service.ts)

**Section sources**
- [services/csrf.service.ts](file://apps/backend/src/auth/services/csrf.service.ts)
- [services/rate-limit.service.ts](file://apps/backend/src/auth/services/rate-limit.service.ts)
- [core/hash/bcrypt.service.ts](file://apps/backend/src/core/hash/bcrypt.service.ts)

### Authentication Endpoints
- Login:
  - Validates credentials, returns access and refresh tokens.
- Registration:
  - Creates user, sends verification email, returns tokens after verification or pending state.
- Password Reset:
  - Generates reset token, sends email, allows setting new password.
- Token Refresh:
  - Accepts refresh token, issues new access token, rotates refresh token if configured.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "AuthController"
participant Service as "AuthService"
participant UserSvc as "UserService"
participant TokenSvc as "TokenService"
Client->>Controller : POST /auth/register
Controller->>Service : register(data)
Service->>UserSvc : createAndVerify(data)
UserSvc-->>Service : user
Service->>TokenSvc : generateTokens(user)
TokenSvc-->>Service : {accessToken, refreshToken}
Service-->>Controller : tokens
Controller-->>Client : {accessToken, refreshToken}
Client->>Controller : POST /auth/reset-password
Controller->>Service : resetPassword(data)
Service->>UserSvc : updatePassword(data)
UserSvc-->>Service : success
Service-->>Controller : ok
Controller-->>Client : 200 OK
```

**Diagram sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [services/user.service.ts](file://apps/backend/src/auth/services/user.service.ts)
- [services/token.service.ts](file://apps/backend/src/auth/services/token.service.ts)

**Section sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)

### Protected Routes and Guard Usage
- Apply JwtGuard to routes requiring authentication.
- Apply RolesGuard with Roles decorator to restrict by role.
- Use CurrentUser decorator to access user context in handlers.

```mermaid
flowchart TD
Route["Protected Route"] --> JwtGuard["JwtGuard validates token"]
JwtGuard --> RolesGuard["RolesGuard checks roles"]
RolesGuard --> Handler["Handler executes with user context"]
```

**Diagram sources**
- [guards/jwt.guard.ts](file://apps/backend/src/auth/guards/jwt.guard.ts)
- [guards/roles.guard.ts](file://apps/backend/src/auth/guards/roles.guard.ts)
- [decorators/current-user.decorator.ts](file://apps/backend/src/auth/decorators/current-user.decorator.ts)
- [decorators/roles.decorator.ts](file://apps/backend/src/auth/decorators/roles.decorator.ts)

**Section sources**
- [guards/jwt.guard.ts](file://apps/backend/src/auth/guards/jwt.guard.ts)
- [guards/roles.guard.ts](file://apps/backend/src/auth/guards/roles.guard.ts)
- [decorators/current-user.decorator.ts](file://apps/backend/src/auth/decorators/current-user.decorator.ts)
- [decorators/roles.decorator.ts](file://apps/backend/src/auth/decorators/roles.decorator.ts)

### User Roles and Permissions System
- Roles are defined per user and enforced by guards.
- Permissions can be derived from roles or managed separately.
- Audit logging records role changes and permission grants.

```mermaid
classDiagram
class UserService {
+assignRole(userId, role) boolean
+removeRole(userId, role) boolean
+hasPermission(userId, permission) boolean
}
```

**Diagram sources**
- [services/user.service.ts](file://apps/backend/src/auth/services/user.service.ts)

**Section sources**
- [services/user.service.ts](file://apps/backend/src/auth/services/user.service.ts)

### Audit Logging for Security Events
- Emit events for login attempts, failures, password resets, and role changes.
- Centralized event emitter aggregates and persists audit logs.

```mermaid
classDiagram
class EventEmmitterService {
+emit(event, payload) void
+on(event, handler) void
}
```

**Diagram sources**
- [core/events/event-emitter.service.ts](file://apps/backend/src/core/events/event-emitter.service.ts)

**Section sources**
- [core/events/event-emitter.service.ts](file://apps/backend/src/core/events/event-emitter.service.ts)

## Dependency Analysis
The auth module depends on core services and configuration:
- Configuration defines JWT secrets, OAuth settings, and rate limits.
- App module registers global guards, interceptors, and modules.
- Main entry configures CORS, helmet, and body parsing.

```mermaid
graph TB
AM["app.module.ts"] --> CM["config/configuration.ts"]
AM --> AuthMod["auth.auth.module.ts"]
Main["main.ts"] --> AM
AuthMod --> CoreHash["core/hash/bcrypt.service.ts"]
AuthMod --> CoreEvents["core/events/event-emitter.service.ts"]
```

**Diagram sources**
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [config/configuration.ts](file://apps/backend/src/config/configuration.ts)
- [auth.module.ts](file://apps/backend/src/auth/auth.module.ts)
- [main.ts](file://apps/backend/src/main.ts)
- [core/hash/bcrypt.service.ts](file://apps/backend/src/core/hash/bcrypt.service.ts)
- [core/events/event-emitter.service.ts](file://apps/backend/src/core/events/event-emitter.service.ts)

**Section sources**
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [config/configuration.ts](file://apps/backend/src/config/configuration.ts)
- [auth.module.ts](file://apps/backend/src/auth/auth.module.ts)
- [main.ts](file://apps/backend/src/main.ts)

## Performance Considerations
- Keep JWT payloads small to reduce overhead.
- Cache frequent user lookups where appropriate.
- Use connection pooling for database interactions.
- Implement token blacklisting carefully to avoid memory growth.
- Monitor rate limiter counters and adjust thresholds based on traffic.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Invalid token errors:
  - Verify secret configuration and token expiration settings.
- OAuth callback failures:
  - Ensure client IDs and secrets match provider configuration.
- Email delivery problems:
  - Check SMTP settings and queue processors.
- Rate limiting blocks legitimate users:
  - Adjust limits and whitelist trusted IPs if necessary.
- CSRF validation errors:
  - Confirm token generation and inclusion in requests.

**Section sources**
- [services/token.service.ts](file://apps/backend/src/auth/services/token.service.ts)
- [strategies/google.strategy.ts](file://apps/backend/src/auth/strategies/google.strategy.ts)
- [services/email.service.ts](file://apps/backend/src/auth/services/email.service.ts)
- [services/rate-limit.service.ts](file://apps/backend/src/auth/services/rate-limit.service.ts)
- [services/csrf.service.ts](file://apps/backend/src/auth/services/csrf.service.ts)

## Conclusion
The authentication and authorization system provides robust JWT-based security with role enforcement, OAuth integration, email verification, and comprehensive security hardening. By following the documented patterns for guards, decorators, and services, developers can implement secure, scalable, and maintainable authentication flows.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices
- Example protected route usage:
  - Apply JwtGuard and RolesGuard to restrict access.
  - Use CurrentUser decorator to read user details.
- Custom decorators:
  - Roles decorator declares required roles.
  - Current user decorator injects authenticated user.
- Audit logging:
  - Emit events for security-sensitive actions.

[No sources needed since this section provides general guidance]