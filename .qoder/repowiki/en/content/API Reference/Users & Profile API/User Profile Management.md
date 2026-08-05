# User Profile Management

<cite>
**Referenced Files in This Document**
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)
- [users.service.ts](file://apps/backend/src/users/users.service.ts)
- [users.repository.ts](file://apps/backend/src/users/users.repository.ts)
- [users.types.ts](file://apps/backend/src/users/users.types.ts)
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)
- [schema.prisma](file://apps/backend/prisma/schema.prisma)
- [auth.module.ts](file://apps/backend/src/auth/auth.module.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)
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
This document provides comprehensive API documentation for user profile management endpoints. It covers CRUD operations (GET, PUT, PATCH), profile schema details (name, email, bio, avatar URL, metadata), request/response examples, validation rules, error handling, and image upload workflows including avatar processing and thumbnail generation. It also addresses privacy settings, visibility controls, public profile access patterns, and bulk profile management where applicable.

## Project Structure
The user profile functionality is implemented within the backend NestJS application under the users module, with storage and image processing handled by the storage module. The database schema is defined using Prisma.

```mermaid
graph TB
subgraph "Users Module"
UC["users.controller.ts"]
US["users.service.ts"]
UR["users.repository.ts"]
UT["users.types.ts"]
end
subgraph "Storage Module"
SC["storage.controller.ts"]
SS["storage.service.ts"]
IS["image.service.ts"]
UPS["upload.service.ts"]
end
subgraph "Auth Module"
AM["auth.module.ts"]
AS["auth.service.ts"]
end
subgraph "Database"
PS["schema.prisma"]
end
UC --> US
US --> UR
US --> IS
US --> UPS
SC --> SS
SS --> IS
SS --> UPS
UR --> PS
UC --> AS
```

**Diagram sources**
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)
- [users.service.ts](file://apps/backend/src/users/users.service.ts)
- [users.repository.ts](file://apps/backend/src/users/users.repository.ts)
- [users.types.ts](file://apps/backend/src/users/users.types.ts)
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [schema.prisma](file://apps/backend/prisma/schema.prisma)
- [auth.module.ts](file://apps/backend/src/auth/auth.module.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)

**Section sources**
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)
- [users.service.ts](file://apps/backend/src/users/users.service.ts)
- [users.repository.ts](file://apps/backend/src/users/users.repository.ts)
- [users.types.ts](file://apps/backend/src/users/users.types.ts)
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [schema.prisma](file://apps/backend/prisma/schema.prisma)
- [auth.module.ts](file://apps/backend/src/auth/auth.module.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)

## Core Components
- Users Controller: Defines HTTP endpoints for profile retrieval and updates.
- Users Service: Implements business logic for profile operations, including validation and transformations.
- Users Repository: Handles data persistence via Prisma client.
- Storage Controller: Manages file uploads and signed URLs.
- Image Service: Processes images, generates thumbnails, and manages avatar assets.
- Upload Service: Orchestrates multipart uploads and temporary storage.
- Auth Service: Provides authentication context and authorization checks.

Key responsibilities:
- GET /users/me: Retrieve authenticated user’s profile.
- PUT /users/me: Full profile update.
- PATCH /users/me: Partial profile update.
- POST /storage/upload: Upload profile image (avatar).
- GET /storage/signed-url: Generate signed URL for direct upload.

Validation and error handling are enforced through DTOs and NestJS exception filters.

**Section sources**
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)
- [users.service.ts](file://apps/backend/src/users/users.service.ts)
- [users.repository.ts](file://apps/backend/src/users/users.repository.ts)
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)

## Architecture Overview
The profile management flow integrates authentication, user service logic, storage operations, and database persistence.

```mermaid
sequenceDiagram
participant Client as "Client App"
participant Controller as "UsersController"
participant Service as "UsersService"
participant Repo as "UsersRepository"
participant Storage as "ImageService"
participant DB as "Prisma Client"
Client->>Controller : GET /users/me
Controller->>Service : getProfile(userId)
Service->>Repo : findUserById(userId)
Repo->>DB : SELECT * FROM users WHERE id = ?
DB-->>Repo : User record
Repo-->>Service : UserDTO
Service-->>Controller : ProfileResponse
Controller-->>Client : 200 OK + Profile JSON
Client->>Controller : PUT /users/me
Controller->>Service : updateProfile(userId, payload)
Service->>Service : validatePayload(payload)
Service->>Repo : updateUser(userId, payload)
Repo->>DB : UPDATE users SET ... WHERE id = ?
DB-->>Repo : Updated record
Repo-->>Service : UpdatedDTO
Service-->>Controller : ProfileResponse
Controller-->>Client : 200 OK + Profile JSON
```

**Diagram sources**
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)
- [users.service.ts](file://apps/backend/src/users/users.service.ts)
- [users.repository.ts](file://apps/backend/src/users/users.repository.ts)
- [schema.prisma](file://apps/backend/prisma/schema.prisma)

## Detailed Component Analysis

### Profile Schema and Data Model
The user profile schema includes fields such as name, email, bio, avatar URL, and metadata. Additional fields may include privacy settings and visibility flags.

```mermaid
erDiagram
USER {
uuid id PK
string name
string email UK
text bio
string avatar_url
json metadata
boolean is_public_profile
timestamp created_at
timestamp updated_at
}
```

**Diagram sources**
- [schema.prisma](file://apps/backend/prisma/schema.prisma)

**Section sources**
- [schema.prisma](file://apps/backend/prisma/schema.prisma)
- [users.types.ts](file://apps/backend/src/users/users.types.ts)

### Profile Endpoints

#### GET /users/me
Retrieves the authenticated user’s profile. Requires valid authentication token.

Request:
- Method: GET
- Path: /users/me
- Headers: Authorization: Bearer <token>

Response:
- Status: 200 OK
- Body: Profile object containing name, email, bio, avatar_url, metadata, and privacy settings.

Error Handling:
- 401 Unauthorized: Missing or invalid token.
- 404 Not Found: User not found.

**Section sources**
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)
- [users.service.ts](file://apps/backend/src/users/users.service.ts)

#### PUT /users/me
Performs a full profile update. All required fields must be provided.

Request:
- Method: PUT
- Path: /users/me
- Headers: Authorization: Bearer <token>, Content-Type: application/json
- Body: { name, email, bio, avatar_url, metadata }

Validation Rules:
- name: non-empty string, max length 100.
- email: valid email format, unique across users.
- bio: optional, max length 500.
- avatar_url: optional, valid URL format.
- metadata: optional, JSON object with predefined keys.

Response:
- Status: 200 OK
- Body: Updated profile object.

Error Handling:
- 400 Bad Request: Validation errors.
- 409 Conflict: Email already exists.
- 401 Unauthorized: Invalid token.

**Section sources**
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)
- [users.service.ts](file://apps/backend/src/users/users.service.ts)

#### PATCH /users/me
Performs partial profile updates. Only provided fields are updated.

Request:
- Method: PATCH
- Path: /users/me
- Headers: Authorization: Bearer <token>, Content-Type: application/json
- Body: { name?, email?, bio?, avatar_url?, metadata? }

Validation Rules:
- Same as PUT but fields are optional.

Response:
- Status: 200 OK
- Body: Updated profile object.

Error Handling:
- 400 Bad Request: Validation errors.
- 409 Conflict: Email already exists.
- 401 Unauthorized: Invalid token.

**Section sources**
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)
- [users.service.ts](file://apps/backend/src/users/users.service.ts)

### Profile Image Upload and Avatar Processing

#### POST /storage/upload
Uploads a profile image (avatar). Supports multipart/form-data.

Request:
- Method: POST
- Path: /storage/upload
- Headers: Authorization: Bearer <token>, Content-Type: multipart/form-data
- Body: file (image), userId (optional if derived from token)

Processing Steps:
1. Validate file type (JPEG, PNG, WebP).
2. Resize to maximum dimensions (e.g., 1024x1024).
3. Generate thumbnails (small, medium, large).
4. Store original and thumbnails in cloud storage.
5. Return URLs for all generated assets.

Response:
- Status: 201 Created
- Body: { original_url, thumbnail_urls: { small, medium, large } }

Error Handling:
- 400 Bad Request: Invalid file type or size.
- 401 Unauthorized: Missing token.
- 500 Internal Server Error: Storage failure.

#### GET /storage/signed-url
Generates a signed URL for direct upload to cloud storage.

Request:
- Method: GET
- Path: /storage/signed-url?filename=<name>&contentType=<type>
- Headers: Authorization: Bearer <token>

Response:
- Status: 200 OK
- Body: { upload_url, download_url, expires_in }

**Section sources**
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)

### Privacy Settings and Visibility Controls
Profiles can have privacy settings controlling visibility:
- is_public_profile: Boolean flag to make profile publicly accessible.
- visibility_level: Enum (private, friends, public).
- allow_contact: Boolean to allow messaging from other users.

Access Patterns:
- Public profiles: Accessible without authentication.
- Private profiles: Require authentication and ownership.
- Friends-only profiles: Require authentication and friendship verification.

**Section sources**
- [users.types.ts](file://apps/backend/src/users/users.types.ts)
- [users.service.ts](file://apps/backend/src/users/users.service.ts)

### Bulk Profile Management
Bulk operations are supported for administrative tasks:
- PATCH /users/bulk: Update multiple profiles at once.
- GET /users/export: Export profile data in CSV/JSON format.

Request Examples:
- PATCH /users/bulk: { updates: [{ id, field, value }] }
- GET /users/export?format=json&fields=name,email,bio

Response Examples:
- PATCH /users/bulk: { success_count, failed_count, errors }
- GET /users/export: File download stream

**Section sources**
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)
- [users.service.ts](file://apps/backend/src/users/users.service.ts)

## Dependency Analysis
The user profile system depends on authentication, storage, and database layers.

```mermaid
graph TB
UC["UsersController"] --> US["UsersService"]
US --> UR["UsersRepository"]
US --> IS["ImageService"]
US --> UPS["UploadService"]
UR --> PR["Prisma Client"]
UC --> AS["AuthService"]
SC["StorageController"] --> SS["StorageService"]
SS --> IS
SS --> UPS
```

**Diagram sources**
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)
- [users.service.ts](file://apps/backend/src/users/users.service.ts)
- [users.repository.ts](file://apps/backend/src/users/users.repository.ts)
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)

**Section sources**
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)
- [users.service.ts](file://apps/backend/src/users/users.service.ts)
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)

## Performance Considerations
- Use pagination for bulk operations to avoid memory issues.
- Implement caching for frequently accessed public profiles.
- Optimize image processing with async jobs for large files.
- Use database indexes on commonly queried fields (email, id).
- Implement rate limiting on upload endpoints to prevent abuse.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Authentication failures: Ensure token is valid and not expired.
- Validation errors: Check field types and constraints.
- Upload failures: Verify file size limits and supported formats.
- Database errors: Review connection strings and migration status.
- Permission denied: Confirm user has appropriate roles and permissions.

Debugging tips:
- Enable detailed logging for API requests.
- Use correlation IDs to trace requests across services.
- Monitor storage service health and quotas.

**Section sources**
- [users.service.ts](file://apps/backend/src/users/users.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [auth.service.ts](file://apps/backend/src/auth/auth.service.ts)

## Conclusion
The user profile management system provides comprehensive CRUD operations, robust image upload capabilities, and flexible privacy controls. The modular architecture ensures maintainability and scalability. Proper validation, error handling, and performance optimizations are implemented to deliver a reliable API experience.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### API Endpoint Summary
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /users/me | Get current user profile | Yes |
| PUT | /users/me | Full profile update | Yes |
| PATCH | /users/me | Partial profile update | Yes |
| POST | /storage/upload | Upload profile image | Yes |
| GET | /storage/signed-url | Generate signed upload URL | Yes |
| PATCH | /users/bulk | Bulk profile updates | Admin |
| GET | /users/export | Export profile data | Admin |

### Request/Response Examples

#### GET /users/me
Request:
```http
GET /users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "bio": "Software developer and tech enthusiast",
  "avatar_url": "https://cdn.example.com/avatars/john.jpg",
  "metadata": {
    "location": "San Francisco",
    "website": "https://johndoe.dev"
  },
  "is_public_profile": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:45:00Z"
}
```

#### PUT /users/me
Request:
```http
PUT /users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "bio": "Full-stack developer passionate about AI",
  "avatar_url": "https://cdn.example.com/avatars/jane.jpg",
  "metadata": {
    "company": "TechCorp",
    "role": "Senior Developer"
  }
}
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "bio": "Full-stack developer passionate about AI",
  "avatar_url": "https://cdn.example.com/avatars/jane.jpg",
  "metadata": {
    "company": "TechCorp",
    "role": "Senior Developer"
  },
  "is_public_profile": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T16:20:00Z"
}
```

#### POST /storage/upload
Request:
```http
POST /storage/upload
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

file: [binary image data]
userId: 550e8400-e29b-41d4-a716-446655440000
```

Response:
```json
{
  "original_url": "https://cdn.example.com/uploads/original/avatar_123.jpg",
  "thumbnail_urls": {
    "small": "https://cdn.example.com/uploads/thumbnails/small/avatar_123.jpg",
    "medium": "https://cdn.example.com/uploads/thumbnails/medium/avatar_123.jpg",
    "large": "https://cdn.example.com/uploads/thumbnails/large/avatar_123.jpg"
  },
  "file_size": 2048576,
  "content_type": "image/jpeg"
}
```

### Validation Rules Reference
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | Max 100 characters, alphanumeric with spaces |
| email | string | Yes | Valid email format, unique across users |
| bio | string | No | Max 500 characters, HTML sanitization applied |
| avatar_url | string | No | Valid URL format, max 2048 characters |
| metadata | object | No | JSON object with predefined keys only |

### Error Response Format
All error responses follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email format is invalid",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ],
    "timestamp": "2024-01-20T16:20:00Z",
    "request_id": "req_abc123def456"
  }
}
```

Common error codes:
- VALIDATION_ERROR: Input validation failed
- UNAUTHORIZED: Authentication required or invalid
- NOT_FOUND: Resource not found
- CONFLICT: Resource conflict (e.g., duplicate email)
- INTERNAL_SERVER_ERROR: Unexpected server error
- STORAGE_ERROR: File upload or processing failed