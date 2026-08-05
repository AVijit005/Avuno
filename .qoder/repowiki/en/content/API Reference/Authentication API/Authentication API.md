# Authentication API

<cite>
**Referenced Files in This Document**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [auth.module.ts](file://apps/backend/src/auth/auth.module.ts)
- [auth.repository.ts](file://apps/backend/src/auth/auth.repository.ts)
- [auth.controller.ts](file://apps/backend/src/auth/controllers/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/services/auth.service.ts)
- [jwt.strategy.ts](file://apps/backend/src/auth/strategies/jwt.strategy.ts)
- [local.strategy.ts](file://apps/backend/src/auth/strategies/local.strategy.ts)
- [oauth.strategy.ts](file://apps/backend/src/auth/strategies/oauth.strategy.ts)
- [jwt.guard.ts](file://apps/backend/src/auth/guards/jwt.guard.ts)
- [roles.guard.ts](file://apps/backend/src/auth/guards/roles.guard.ts)
- [rate-limit.guard.ts](file://apps/backend/src/auth/guards/rate-limit.guard.ts)
- [auth.dto.ts](file://apps/backend/src/auth/dto/auth.dto.ts)
- [register.dto.ts](file://apps/backend/src/auth/dto/register.dto.ts)
- [login.dto.ts](file://apps/backend/src/auth/dto/login.dto.ts)
- [refresh.dto.ts](file://apps/backend/src/auth/dto/refresh.dto.ts)
- [password.dto.ts](file://apps/backend/src/auth/dto/password.dto.ts)
- [email-verify.dto.ts](file://apps/backend/src/auth/dto/email-verify.dto.ts)
- [user.service.ts](file://apps/backend/src/users/services/user.service.ts)
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)
- [configuration.ts](file://apps/backend/src/config/configuration.ts)
- [env.validation.ts](file://apps/backend/src/config/env.validation.ts)
- [schema.prisma](file://apps/backend/prisma/schema.prisma)
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
This document provides comprehensive API documentation for the authentication subsystem, covering user registration, login, logout, password management, email verification, and OAuth integration. It specifies HTTP methods, URL patterns, request/response schemas, JWT token structure, refresh token flow, role-based authorization, session management, security considerations (password policies, token expiration, rate limiting), and error handling.

## Project Structure
The authentication system is implemented as a NestJS module with controllers, services, DTOs, guards, strategies, and repositories. Key areas:
- Controllers expose HTTP endpoints for auth flows.
- Services implement business logic (registration, login, password reset, email verification, OAuth).
- Guards enforce JWT validation, roles, and rate limits.
- Strategies handle JWT and OAuth authentication.
- Repositories interact with persistence (Prisma).
- Configuration defines environment variables and validation.

```mermaid
graph TB
Client["Client"] --> AC["Auth Controller<br/>HTTP Endpoints"]
AC --> AS["Auth Service<br/>Business Logic"]
AS --> UR["User Repository<br/>Persistence"]
AS --> US["User Service<br/>User Management"]
AC --> RG["Roles Guard<br/>RBAC"]
AC --> JG["JWT Guard<br/>Token Validation"]
AC --> RL["Rate Limit Guard<br/>Throttling"]
AS --> JS["JWT Strategy<br/>Token Handling"]
AS --> OS["OAuth Strategy<br/>Provider Integration"]
```

**Diagram sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [auth.repository.ts](file://apps/backend/src/auth/auth.repository.ts)
- [jwt.guard.ts](file://apps/backend/src/auth/guards/jwt.guard.ts)
- [roles.guard.ts](file://apps/backend/src/auth/guards/roles.guard.ts)
- [rate-limit.guard.ts](file://apps/backend/src/auth/guards/rate-limit.guard.ts)
- [jwt.strategy.ts](file://apps/backend/src/auth/strategies/jwt.strategy.ts)
- [oauth.strategy.ts](file://apps/backend/src/auth/strategies/oauth.strategy.ts)

**Section sources**
- [auth.module.ts](file://apps/backend/src/auth/auth.module.ts)
- [configuration.ts](file://apps/backend/src/config/configuration.ts)
- [env.validation.ts](file://apps/backend/src/config/env.validation.ts)

## Core Components
- Auth Controller: Defines HTTP routes for register, login, logout, refresh, password change/reset, email verification, and OAuth callbacks.
- Auth Service: Orchestrates registration, credential validation, token issuance, refresh, password operations, email verification, and OAuth flows.
- Guards: JWT guard validates tokens; Roles guard enforces RBAC; Rate Limit guard throttles requests.
- Strategies: JWT strategy decodes and validates tokens; OAuth strategy integrates with providers.
- Repositories: Data access layer for users, sessions, and tokens using Prisma.
- DTOs: Request/response schemas for all endpoints.

Key responsibilities:
- Registration: Validate input, create user, send verification email, return success or errors.
- Login: Verify credentials, issue access and refresh tokens, set session state if applicable.
- Logout: Invalidate refresh tokens and revoke sessions.
- Password Management: Enforce policy, hash passwords, support reset via email.
- Email Verification: Generate and validate verification codes/tokens.
- OAuth: Handle provider redirects, callback processing, linking accounts, issuing tokens.

**Section sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [auth.repository.ts](file://apps/backend/src/auth/auth.repository.ts)
- [jwt.guard.ts](file://apps/backend/src/auth/guards/jwt.guard.ts)
- [roles.guard.ts](file://apps/backend/src/auth/guards/roles.guard.ts)
- [rate-limit.guard.ts](file://apps/backend/src/auth/guards/rate-limit.guard.ts)
- [jwt.strategy.ts](file://apps/backend/src/auth/strategies/jwt.strategy.ts)
- [oauth.strategy.ts](file://apps/backend/src/auth/strategies/oauth.strategy.ts)
- [auth.dto.ts](file://apps/backend/src/auth/dto/auth.dto.ts)
- [register.dto.ts](file://apps/backend/src/auth/dto/register.dto.ts)
- [login.dto.ts](file://apps/backend/src/auth/dto/login.dto.ts)
- [refresh.dto.ts](file://apps/backend/src/auth/dto/refresh.dto.ts)
- [password.dto.ts](file://apps/backend/src/auth/dto/password.dto.ts)
- [email-verify.dto.ts](file://apps/backend/src/auth/dto/email-verify.dto.ts)

## Architecture Overview
The authentication architecture follows a layered approach:
- HTTP Layer: Controllers define REST endpoints.
- Business Layer: Services encapsulate domain logic.
- Security Layer: Guards and strategies manage authentication and authorization.
- Persistence Layer: Repositories use Prisma to read/write data.
- Configuration: Environment-driven settings for secrets, token lifetimes, and rate limits.

```mermaid
sequenceDiagram
participant C as "Client"
participant A as "Auth Controller"
participant S as "Auth Service"
participant R as "Auth Repository"
participant U as "User Service"
participant G as "Guards/Strategies"
C->>A : POST /auth/register
A->>G : Apply Rate Limit & Input Validation
A->>S : register(payload)
S->>R : create user
S->>U : send verification email
S-->>A : {success, message}
A-->>C : 201 Created
C->>A : POST /auth/login
A->>G : Apply Rate Limit
A->>S : login(credentials)
S->>R : verify credentials
S-->>A : {accessToken, refreshToken}
A-->>C : 200 OK
```

**Diagram sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [auth.repository.ts](file://apps/backend/src/auth/auth.repository.ts)
- [user.service.ts](file://apps/backend/src/users/services/user.service.ts)
- [jwt.guard.ts](file://apps/backend/src/auth/guards/jwt.guard.ts)
- [rate-limit.guard.ts](file://apps/backend/src/auth/guards/rate-limit.guard.ts)

## Detailed Component Analysis

### Registration Endpoint
- Method: POST
- URL: /auth/register
- Request Body: Defined by Register DTO (username, email, password, optional fields).
- Response: Success with message; error responses for validation failures, duplicate email/username.
- Behavior: Creates user, hashes password, sends verification email, returns status.

```mermaid
flowchart TD
Start(["POST /auth/register"]) --> Validate["Validate Input"]
Validate --> Exists{"Email/Username exists?"}
Exists --> |Yes| ReturnError["Return Conflict/Error"]
Exists --> |No| CreateUser["Create User Record"]
CreateUser --> SendEmail["Send Verification Email"]
SendEmail --> Success["Return 201 Created"]
```

**Diagram sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [register.dto.ts](file://apps/backend/src/auth/dto/register.dto.ts)

**Section sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [register.dto.ts](file://apps/backend/src/auth/dto/register.dto.ts)

### Login Endpoint
- Method: POST
- URL: /auth/login
- Request Body: Defined by Login DTO (email/username, password).
- Response: Access token and refresh token; error on invalid credentials.
- Behavior: Validates credentials, issues JWT access token and refresh token, may set session state.

```mermaid
sequenceDiagram
participant C as "Client"
participant A as "Auth Controller"
participant S as "Auth Service"
participant R as "Auth Repository"
C->>A : POST /auth/login
A->>S : login(credentials)
S->>R : find user by email/username
R-->>S : user record
S->>S : verify password
S-->>A : {accessToken, refreshToken}
A-->>C : 200 OK
```

**Diagram sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [login.dto.ts](file://apps/backend/src/auth/dto/login.dto.ts)
- [auth.repository.ts](file://apps/backend/src/auth/auth.repository.ts)

**Section sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [login.dto.ts](file://apps/backend/src/auth/dto/login.dto.ts)

### Refresh Token Flow
- Method: POST
- URL: /auth/refresh
- Request Body: Defined by Refresh DTO (refreshToken).
- Response: New accessToken; error if refresh token invalid/expired.
- Behavior: Validates refresh token, issues new access token, rotates refresh token if configured.

```mermaid
flowchart TD
Start(["POST /auth/refresh"]) --> ValidateRefresh["Validate refreshToken"]
ValidateRefresh --> Valid{"Valid and not expired?"}
Valid --> |No| Error["Return 401 Unauthorized"]
Valid --> |Yes| IssueToken["Issue new accessToken"]
IssueToken --> Rotate{"Rotate refreshToken?"}
Rotate --> |Yes| UpdateRefresh["Update stored refresh token"]
Rotate --> |No| Skip["Skip update"]
UpdateRefresh --> Success["Return 200 OK"]
Skip --> Success
```

**Diagram sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [refresh.dto.ts](file://apps/backend/src/auth/dto/refresh.dto.ts)

**Section sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [refresh.dto.ts](file://apps/backend/src/auth/dto/refresh.dto.ts)

### Logout Endpoint
- Method: POST
- URL: /auth/logout
- Request Body: Optional payload including refreshToken or sessionId.
- Response: Success message; error if token/session not found.
- Behavior: Invalidates refresh tokens, revokes sessions, clears server-side state.

```mermaid
sequenceDiagram
participant C as "Client"
participant A as "Auth Controller"
participant S as "Auth Service"
participant R as "Auth Repository"
C->>A : POST /auth/logout
A->>S : logout(refreshToken/sessionId)
S->>R : invalidate refresh token(s)
S->>R : revoke session(s)
S-->>A : {success}
A-->>C : 200 OK
```

**Diagram sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [auth.repository.ts](file://apps/backend/src/auth/auth.repository.ts)

**Section sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)

### Password Management
- Change Password:
  - Method: PUT/PATCH
  - URL: /auth/password/change
  - Request Body: Defined by Password DTO (currentPassword, newPassword).
  - Response: Success or error for invalid current password or policy violation.
- Reset Password:
  - Method: POST
  - URL: /auth/password/reset
  - Request Body: Email address to initiate reset.
  - Response: Success message; verification email sent.
- Confirm Reset:
  - Method: POST
  - URL: /auth/password/reset/confirm
  - Request Body: Reset token and new password.
  - Response: Success or error for invalid/expired token.

```mermaid
flowchart TD
Start(["Password Operations"]) --> Change["Change Password"]
Start --> Reset["Reset Password"]
Start --> Confirm["Confirm Reset"]
Change --> ValidateCurrent["Validate current password"]
ValidateCurrent --> PolicyCheck["Enforce password policy"]
PolicyCheck --> HashNew["Hash new password"]
HashNew --> Save["Save updated password"]
Reset --> SendEmail["Send reset email"]
Confirm --> ValidateToken["Validate reset token"]
ValidateToken --> SetNew["Set new password"]
```

**Diagram sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [password.dto.ts](file://apps/backend/src/auth/dto/password.dto.ts)

**Section sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [password.dto.ts](file://apps/backend/src/auth/dto/password.dto.ts)

### Email Verification
- Send Verification:
  - Method: POST
  - URL: /auth/email/verify/send
  - Request Body: Email address.
  - Response: Success message; verification email sent.
- Confirm Verification:
  - Method: POST
  - URL: /auth/email/verify/confirm
  - Request Body: Defined by Email Verify DTO (token/code).
  - Response: Success or error for invalid/expired token.

```mermaid
sequenceDiagram
participant C as "Client"
participant A as "Auth Controller"
participant S as "Auth Service"
participant U as "User Service"
C->>A : POST /auth/email/verify/send
A->>S : sendVerification(email)
S->>U : generate token/code
U-->>S : token/code
S-->>A : {success}
A-->>C : 200 OK
C->>A : POST /auth/email/verify/confirm
A->>S : confirmVerification(token)
S->>S : validate token
S-->>A : {success}
A-->>C : 200 OK
```

**Diagram sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [email-verify.dto.ts](file://apps/backend/src/auth/dto/email-verify.dto.ts)
- [user.service.ts](file://apps/backend/src/users/services/user.service.ts)

**Section sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [email-verify.dto.ts](file://apps/backend/src/auth/dto/email-verify.dto.ts)

### OAuth Integration
- Initiate OAuth:
  - Method: GET
  - URL: /auth/oauth/:provider
  - Response: Redirect to provider authorization page.
- OAuth Callback:
  - Method: GET
  - URL: /auth/oauth/:provider/callback
  - Query Parameters: Provider-specific code/state.
  - Response: Redirect with tokens or sets cookies; may link existing account.
- Behavior: Validates provider response, creates or links user, issues JWT tokens.

```mermaid
sequenceDiagram
participant C as "Client"
participant A as "Auth Controller"
participant S as "Auth Service"
participant P as "OAuth Provider"
C->>A : GET /auth/oauth/google
A->>P : redirect to authorization
P-->>A : callback with code
A->>S : handleCallback(provider, code)
S->>P : exchange code for user info
P-->>S : user profile
S->>S : create/link user
S-->>A : {accessToken, refreshToken}
A-->>C : redirect with tokens
```

**Diagram sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [oauth.strategy.ts](file://apps/backend/src/auth/strategies/oauth.strategy.ts)

**Section sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth/service.ts)
- [oauth.strategy.ts](file://apps/backend/src/auth/strategies/oauth.strategy.ts)

### Role-Based Authorization
- Mechanism: Roles guard checks user roles from JWT payload or session.
- Usage: Applied to protected endpoints requiring specific roles.
- Policies: Define role hierarchy and permissions per endpoint.

```mermaid
classDiagram
class RolesGuard {
+canActivate(context) bool
-hasRequiredRole(user, requiredRoles) bool
}
class JwtStrategy {
+validate(payload) User
}
class AuthController {
+protectedEndpoint() Response
}
RolesGuard --> JwtStrategy : "uses validated user"
AuthController --> RolesGuard : "applies RBAC"
```

**Diagram sources**
- [roles.guard.ts](file://apps/backend/src/auth/guards/roles.guard.ts)
- [jwt.strategy.ts](file://apps/backend/src/auth/strategies/jwt.strategy.ts)
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)

**Section sources**
- [roles.guard.ts](file://apps/backend/src/auth/guards/roles.guard.ts)
- [jwt.strategy.ts](file://apps/backend/src/auth/strategies/jwt.strategy.ts)
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)

### Session Management
- Stateful Sessions: May be used alongside JWT for additional context.
- Storage: Server-side session store (e.g., Redis) linked to user identity.
- Lifecycle: Created on login, updated on activity, invalidated on logout.

```mermaid
flowchart TD
Start(["Login"]) --> CreateSession["Create Session"]
CreateSession --> Store["Store Session Data"]
Store --> Activity["On Each Request"]
Activity --> Update["Update Last Accessed"]
Update --> CheckExpiry{"Expired?"}
CheckExpiry --> |Yes| Revoke["Revoke Session"]
CheckExpiry --> |No| Continue["Continue Request"]
Revoke --> Logout["Logout"]
```

**Diagram sources**
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [auth.repository.ts](file://apps/backend/src/auth/auth.repository.ts)

**Section sources**
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [auth.repository.ts](file://apps/backend/src/auth/auth.repository.ts)

## Dependency Analysis
Authentication components depend on configuration, user management, and persistence layers. Guards and strategies are integrated into controllers to enforce security policies.

```mermaid
graph TB
AC["Auth Controller"] --> AS["Auth Service"]
AS --> AR["Auth Repository"]
AS --> US["User Service"]
AC --> JG["JWT Guard"]
AC --> RG["Roles Guard"]
AC --> RL["Rate Limit Guard"]
AS --> JS["JWT Strategy"]
AS --> OS["OAuth Strategy"]
AS --> CFG["Configuration"]
```

**Diagram sources**
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [auth.repository.ts](file://apps/backend/src/auth/auth.repository.ts)
- [user.service.ts](file://apps/backend/src/users/services/user.service.ts)
- [jwt.guard.ts](file://apps/backend/src/auth/guards/jwt.guard.ts)
- [roles.guard.ts](file://apps/backend/src/auth/guards/roles.guard.ts)
- [rate-limit.guard.ts](file://apps/backend/src/auth/guards/rate-limit.guard.ts)
- [jwt.strategy.ts](file://apps/backend/src/auth/strategies/jwt.strategy.ts)
- [oauth.strategy.ts](file://apps/backend/src/auth/strategies/oauth.strategy.ts)
- [configuration.ts](file://apps/backend/src/config/configuration.ts)

**Section sources**
- [auth.module.ts](file://apps/backend/src/auth/auth.module.ts)
- [configuration.ts](file://apps/backend/src/config/configuration.ts)
- [env.validation.ts](file://apps/backend/src/config/env.validation.ts)

## Performance Considerations
- Token Issuance: Minimize cryptographic overhead by caching public keys and optimizing JWT signing.
- Rate Limiting: Configure appropriate thresholds to prevent abuse without impacting legitimate traffic.
- Database Queries: Use efficient lookups and indexes for user retrieval and token validation.
- Session Storage: Choose fast storage (e.g., Redis) for high-throughput environments.
- Email Queues: Offload email sending to background jobs to reduce latency.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Invalid Credentials: Ensure correct email/username and password; check hashing algorithm consistency.
- Token Expired: Implement automatic refresh token rotation; handle 401 responses gracefully.
- Rate Limited: Adjust rate limit configurations; monitor client request patterns.
- Email Not Received: Verify email service configuration; check spam filters; retry mechanisms.
- OAuth Failures: Validate provider secrets; ensure correct redirect URIs; inspect callback payloads.

**Section sources**
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
- [configuration.ts](file://apps/backend/src/config/configuration.ts)
- [env.validation.ts](file://apps/backend/src/config/env.validation.ts)

## Conclusion
The authentication API provides robust features for user lifecycle management, secure token handling, and flexible authorization. By following the documented endpoints, schemas, and security practices, clients can integrate seamlessly while maintaining high security and performance standards.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### JWT Token Structure
- Access Token: Short-lived, contains user identity and roles; signed with server secret.
- Refresh Token: Longer-lived, stored securely; used to obtain new access tokens.
- Claims: Include user ID, roles, issued at, expiration, and optional metadata.

**Section sources**
- [jwt.strategy.ts](file://apps/backend/src/auth/strategies/jwt.strategy.ts)
- [configuration.ts](file://apps/backend/src/config/configuration.ts)

### Password Policies
- Minimum length, complexity requirements, history enforcement.
- Secure hashing algorithm (e.g., bcrypt, argon2).
- Regular audits and updates to policy compliance.

**Section sources**
- [password.dto.ts](file://apps/backend/src/auth/dto/password.dto.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)

### Rate Limiting
- Configurable limits per IP/user.
- Throttling middleware applied to sensitive endpoints.
- Monitoring and alerting for abuse detection.

**Section sources**
- [rate-limit.guard.ts](file://apps/backend/src/auth/guards/rate-limit.guard.ts)
- [configuration.ts](file://apps/backend/src/config/configuration.ts)

### Schema Definitions
- Users: Identity, email, hashed password, roles, verification status.
- Tokens: Refresh tokens with expiry and revocation flags.
- Sessions: Active sessions with last accessed timestamps.

**Section sources**
- [schema.prisma](file://apps/backend/prisma/schema.prisma)