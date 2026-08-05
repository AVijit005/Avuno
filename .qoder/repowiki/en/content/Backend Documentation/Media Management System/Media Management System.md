# Media Management System

<cite>
**Referenced Files in This Document**
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [media-metadata.service.ts](file://apps/backend/src/media/media-metadata.service.ts)
- [slug.service.ts](file://apps/backend/src/media/slug.service.ts)
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)
- [image-processor.service.ts](file://apps/backend/src/storage/image-processor.service.ts)
- [signed-url.service.ts](file://apps/backend/src/storage/signed-url.service.ts)
- [media-cleanup.service.ts](file://apps/backend/src/storage/media-cleanup.service.ts)
- [schema.prisma](file://apps/backend/prisma/schema.prisma)
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [core.storage.index.ts](file://apps/backend/src/core/storage/index.ts)
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
This document provides comprehensive documentation for the media management system within the backend application. It covers CRUD operations for media items, metadata extraction and processing, image optimization workflows, CDN integration patterns, file upload handling, storage abstraction supporting local and cloud backends, media transformation pipelines, repository pattern implementation for data access, search and filtering capabilities, and performance optimizations for large media libraries.

## Project Structure
The media subsystem is implemented as a NestJS module with clear separation of concerns:
- Controllers expose HTTP endpoints for media and storage operations.
- Services encapsulate business logic for media lifecycle, metadata extraction, and transformations.
- Repositories abstract database interactions using Prisma.
- Storage services provide an abstraction layer over different backends (local filesystem and cloud object storage).
- Image processors handle optimization and format conversions.
- Signed URL service enables secure CDN access.

```mermaid
graph TB
subgraph "Media Module"
MC["media.controller.ts"]
MS["media.service.ts"]
MR["media.repository.ts"]
MMS["media-metadata.service.ts"]
SLUG["slug.service.ts"]
end
subgraph "Storage Module"
SC["storage.controller.ts"]
US["upload.service.ts"]
SS["storage.service.ts"]
IS["image.service.ts"]
IPS["image-processor.service.ts"]
SU["signed-url.service.ts"]
MCS["media-cleanup.service.ts"]
end
subgraph "Data Layer"
PRISMA["Prisma Client<br/>schema.prisma"]
end
MC --> MS
MS --> MR
MS --> MMS
MS --> SS
MS --> IS
MS --> SU
SC --> US
US --> SS
SS --> PRISMA
IS --> IPS
SS --> SU
```

**Diagram sources**
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [media-metadata.service.ts](file://apps/backend/src/media/media-metadata.service.ts)
- [slug.service.ts](file://apps/backend/src/media/slug.service.ts)
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)
- [image-processor.service.ts](file://apps/backend/src/storage/image-processor.service.ts)
- [signed-url.service.ts](file://apps/backend/src/storage/signed-url.service.ts)
- [media-cleanup.service.ts](file://apps/backend/src/storage/media-cleanup.service.ts)
- [schema.prisma](file://apps/backend/prisma/schema.prisma)

**Section sources**
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [core.storage.index.ts](file://apps/backend/src/core/storage/index.ts)

## Core Components
- Media Controller: Defines REST endpoints for creating, reading, updating, deleting, and listing media items; integrates with upload and storage services.
- Media Service: Orchestrates media lifecycle, coordinates metadata extraction, triggers image optimization, manages URLs, and delegates persistence to the repository.
- Media Repository: Encapsulates Prisma queries for media entities, including filtering, pagination, and relationships.
- Metadata Service: Extracts and normalizes metadata from uploaded files (e.g., dimensions, duration, MIME type).
- Slug Service: Generates URL-friendly slugs for media identifiers.
- Upload Service: Handles multipart uploads, validates payloads, and routes to storage backends.
- Storage Service: Abstracts storage operations across local filesystem and cloud providers; manages paths, permissions, and cleanup.
- Image Service: Provides image-specific operations like resizing, cropping, and format conversion.
- Image Processor: Executes heavy image transformations asynchronously or synchronously depending on configuration.
- Signed URL Service: Generates time-limited signed URLs for secure CDN delivery.
- Media Cleanup Service: Removes orphaned files and enforces retention policies.

**Section sources**
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [media-metadata.service.ts](file://apps/backend/src/media/media-metadata.service.ts)
- [slug.service.ts](file://apps/backend/src/media/slug.service.ts)
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)
- [image-processor.service.ts](file://apps/backend/src/storage/image-processor.service.ts)
- [signed-url.service.ts](file://apps/backend/src/storage/signed-url.service.ts)
- [media-cleanup.service.ts](file://apps/backend/src/storage/media-cleanup.service.ts)

## Architecture Overview
The media management system follows a layered architecture:
- Presentation Layer: Controllers handle HTTP requests and responses.
- Application Layer: Services implement use cases and orchestrate domain logic.
- Domain Layer: Entities and value objects represent media concepts and rules.
- Infrastructure Layer: Repositories interact with databases; storage services abstract file systems and cloud providers.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "MediaController"
participant Service as "MediaService"
participant Repo as "MediaRepository"
participant Meta as "MetadataService"
participant Img as "ImageService"
participant Store as "StorageService"
participant CDN as "SignedURLService"
Client->>Controller : POST /media (multipart)
Controller->>Service : createMedia(file, metadata)
Service->>Meta : extract(file)
Meta-->>Service : normalized metadata
Service->>Store : save(file)
Store-->>Service : {path, url}
Service->>Img : optimize(path, options)
Img-->>Service : optimized path/url
Service->>Repo : persist({media, meta})
Repo-->>Service : persisted entity
Service->>CDN : generateSignedUrl(url)
CDN-->>Service : signedUrl
Service-->>Controller : response
Controller-->>Client : 201 Created + media details
```

**Diagram sources**
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [media-metadata.service.ts](file://apps/backend/src/media/media-metadata.service.ts)
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [signed-url.service.ts](file://apps/backend/src/storage/signed-url.service.ts)

## Detailed Component Analysis

### Media CRUD Operations
- Create: Accepts multipart form data, validates file types and sizes, extracts metadata, persists media record, optimizes images, and returns canonical URLs.
- Read: Retrieves media by ID or slug, supports include/exclude fields, and returns enriched metadata.
- Update: Updates metadata fields and optional reprocessing flags; prevents direct file replacement unless explicitly allowed.
- Delete: Soft deletes media records and optionally removes associated files based on policy.
- List: Supports pagination, sorting, and filtering by type, tags, dates, and user ownership.

```mermaid
flowchart TD
Start(["Create Media"]) --> Validate["Validate Input<br/>type, size, mime"]
Validate --> |Valid| ExtractMeta["Extract Metadata"]
Validate --> |Invalid| ReturnError["Return Validation Error"]
ExtractMeta --> SaveFile["Save File to Storage"]
SaveFile --> Optimize["Optimize Images if applicable"]
Optimize --> Persist["Persist Media Record"]
Persist --> GenerateURL["Generate Signed URL"]
GenerateURL --> ReturnSuccess["Return Media Entity"]
ReturnError --> End(["End"])
ReturnSuccess --> End
```

**Diagram sources**
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media-metadata.service.ts](file://apps/backend/src/media/media-metadata.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)
- [signed-url.service.ts](file://apps/backend/src/storage/signed-url.service.ts)

**Section sources**
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)

### Metadata Extraction and Processing
- Supported formats: images (JPEG, PNG, WebP), videos (MP4, MOV), audio (MP3, AAC).
- Extracted properties: width, height, duration, bitrate, codec, color space, EXIF/IPTC where available.
- Normalization: Converts units, maps vendor-specific fields to canonical schema, handles missing values gracefully.
- Caching: Stores extracted metadata to avoid repeated expensive reads.

```mermaid
classDiagram
class MetadataService {
+extract(file) : Promise~Metadata~
+normalize(raw) : Metadata
+cache(key, value) : void
+get(key) : Metadata?
}
class MediaService {
+createMedia(file, input) : Promise~Media~
+updateMedia(id, updates) : Promise~Media~
+listMedia(filters) : Promise~Media[]~
}
MetadataService <.. MediaService : "used by"
```

**Diagram sources**
- [media-metadata.service.ts](file://apps/backend/src/media/media-metadata.service.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)

**Section sources**
- [media-metadata.service.ts](file://apps/backend/src/media/media-metadata.service.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)

### Image Optimization Workflows
- Pipeline stages: validation, thumbnail generation, responsive variants, format conversion (e.g., WebP), quality tuning, and caching.
- Async processing: Heavy transformations are queued or executed off the critical path when configured.
- Output control: Configurable resolution limits, aspect ratio preservation, and progressive encoding.

```mermaid
flowchart TD
Ingest["Input Image"] --> Validate["Validate Format & Size"]
Validate --> Thumbnail["Generate Thumbnails"]
Thumbnail --> Variants["Create Responsive Variants"]
Variants --> Convert["Convert to Optimized Formats"]
Convert --> Quality["Apply Quality Settings"]
Quality --> Cache["Cache Results"]
Cache --> Out["Output URLs"]
```

**Diagram sources**
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)
- [image-processor.service.ts](file://apps/backend/src/storage/image-processor.service.ts)

**Section sources**
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)
- [image-processor.service.ts](file://apps/backend/src/storage/image-processor.service.ts)

### CDN Integration Patterns
- Signed URLs: Time-limited tokens ensure secure access to private assets.
- Cache-Control: Headers set for optimal browser and CDN caching behavior.
- Fallback: Direct storage URLs used when CDN is unavailable or disabled.
- Region routing: Optional CDN edge selection based on client location.

```mermaid
sequenceDiagram
participant Client as "Client"
participant API as "API Server"
participant CDN as "CDN"
participant Store as "Storage Backend"
Client->>API : Request asset URL
API->>CDN : Check cache for asset
alt Cache Hit
CDN-->>Client : 200 OK + asset
else Cache Miss
API->>Store : Fetch original asset
Store-->>API : Stream bytes
API->>CDN : Upload to CDN
CDN-->>Client : 200 OK + asset
end
```

**Diagram sources**
- [signed-url.service.ts](file://apps/backend/src/storage/signed-url.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)

**Section sources**
- [signed-url.service.ts](file://apps/backend/src/storage/signed-url.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)

### File Upload Handling
- Multipart parsing: Validates content-type, size limits, and field presence.
- Temporary storage: Writes to temp directory before finalizing to storage backend.
- Deduplication: Optional hash-based deduplication to prevent duplicate uploads.
- Progress tracking: Streams progress events for large uploads.

```mermaid
flowchart TD
Start(["Upload Request"]) --> Parse["Parse Multipart"]
Parse --> Validate["Validate Fields & Limits"]
Validate --> |Valid| Temp["Write to Temp"]
Validate --> |Invalid| Error["Return 400 Bad Request"]
Temp --> Finalize["Finalize to Storage"]
Finalize --> CleanTemp["Cleanup Temp Files"]
CleanTemp --> Success["Return Upload Result"]
Error --> End(["End"])
Success --> End
```

**Diagram sources**
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)

**Section sources**
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)

### Storage Abstraction Layer
- Backends: Local filesystem and cloud object storage (e.g., S3-compatible).
- Path strategy: Consistent key naming, versioning, and folder organization.
- Operations: put, get, delete, list, exists, copy, move.
- Configuration: Environment-driven selection and credentials management.

```mermaid
classDiagram
class StorageService {
+put(key, stream, options) : Promise~string~
+get(key) : Promise~ReadableStream~
+delete(key) : Promise~void~
+exists(key) : Promise~boolean~
+list(prefix) : Promise~string[]~
}
class LocalStorageAdapter {
+put(key, stream, options) : Promise~string~
+get(key) : Promise~ReadableStream~
+delete(key) : Promise~void~
}
class CloudStorageAdapter {
+put(key, stream, options) : Promise~string~
+get(key) : Promise~ReadableStream~
+delete(key) : Promise~void~
}
StorageService <|-- LocalStorageAdapter
StorageService <|-- CloudStorageAdapter
```

**Diagram sources**
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [core.storage.index.ts](file://apps/backend/src/core/storage/index.ts)

**Section sources**
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [core.storage.index.ts](file://apps/backend/src/core/storage/index.ts)

### Media Transformation Pipelines
- Pipeline definition: Chain of processors applied in order (e.g., resize, watermark, compress).
- Parallelism: Independent steps executed concurrently where possible.
- Error resilience: Retries and fallback strategies per step.
- Observability: Metrics and logs for each stage.

```mermaid
flowchart TD
A["Original Media"] --> B["Resize"]
B --> C["Watermark"]
C --> D["Compress"]
D --> E["Format Convert"]
E --> F["Output Variants"]
```

[No sources needed since this diagram shows conceptual workflow, not actual code structure]

**Section sources**
- [image-processor.service.ts](file://apps/backend/src/storage/image-processor.service.ts)
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)

### Repository Pattern Implementation
- Data Access: Encapsulates all Prisma queries for media entities.
- Query Building: Composes filters, sorts, and includes dynamically.
- Transactions: Ensures consistency for multi-step operations.
- Caching: Optional read-through cache for frequent queries.

```mermaid
classDiagram
class MediaRepository {
+create(data) : Promise~Media~
+findById(id) : Promise~Media?~
+findBySlug(slug) : Promise~Media?~
+list(filters, pagination) : Promise~Media[]~
+update(id, data) : Promise~Media~
+delete(id) : Promise~boolean~
}
class PrismaClient {
+media : any
}
MediaRepository --> PrismaClient : "uses"
```

**Diagram sources**
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [schema.prisma](file://apps/backend/prisma/schema.prisma)

**Section sources**
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [schema.prisma](file://apps/backend/prisma/schema.prisma)

### Search and Filtering Capabilities
- Filters: Type, tags, date ranges, ownership, status, and custom attributes.
- Sorting: By created date, popularity, relevance, and custom metrics.
- Pagination: Cursor-based or offset-based with consistent ordering.
- Full-text: Optional text search on titles and descriptions.

```mermaid
flowchart TD
Q["Query Params"] --> BuildFilter["Build Filter Object"]
BuildFilter --> ApplySort["Apply Sort Rules"]
ApplySort --> Paginate["Paginate Results"]
Paginate --> Execute["Execute Query"]
Execute --> Map["Map to DTOs"]
Map --> Return["Return Response"]
```

**Diagram sources**
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)

**Section sources**
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)

### Performance Optimizations for Large Libraries
- Indexing: Database indexes on frequently queried columns (type, owner_id, created_at).
- Lazy Loading: Avoid eager loading large binary fields; fetch on demand.
- Streaming: Stream uploads and downloads to reduce memory footprint.
- Caching: Cache metadata and computed URLs; invalidate on changes.
- Batch Operations: Use bulk inserts/updates for migrations and imports.

**Section sources**
- [schema.prisma](file://apps/backend/prisma/schema.prisma)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)

## Dependency Analysis
The media module depends on storage, metadata, and repository layers. The storage module abstracts backends and integrates with CDN via signed URLs.

```mermaid
graph LR
MediaController["media.controller.ts"] --> MediaService["media.service.ts"]
MediaService --> MediaRepository["media.repository.ts"]
MediaService --> MetadataService["media-metadata.service.ts"]
MediaService --> StorageService["storage.service.ts"]
MediaService --> ImageService["image.service.ts"]
MediaService --> SignedURLService["signed-url.service.ts"]
StorageService --> Prisma["Prisma Client"]
ImageService --> ImageProcessor["image-processor.service.ts"]
```

**Diagram sources**
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [media-metadata.service.ts](file://apps/backend/src/media/media-metadata.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [image.service.ts](file://apps/backend/src/storage/image.service.ts)
- [image-processor.service.ts](file://apps/backend/src/storage/image-processor.service.ts)
- [signed-url.service.ts](file://apps/backend/src/storage/signed-url.service.ts)
- [schema.prisma](file://apps/backend/prisma/schema.prisma)

**Section sources**
- [app.module.ts](file://apps/backend/src/app.module.ts)

## Performance Considerations
- Prefer streaming for large files to minimize memory usage.
- Use cursor-based pagination for stable result sets at scale.
- Cache metadata aggressively and invalidate on updates.
- Offload heavy transformations to background jobs when possible.
- Tune database indexes based on query patterns and monitor slow queries.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Upload failures: Validate multipart parsing, check size limits, and inspect temporary storage permissions.
- Metadata errors: Ensure supported formats and handle missing EXIF/IPTC gracefully.
- Storage issues: Verify backend credentials, network connectivity, and bucket/container permissions.
- CDN problems: Confirm signed URL expiration, CORS settings, and cache invalidation policies.
- Cleanup tasks: Run periodic cleanup to remove orphaned files and enforce retention.

**Section sources**
- [media-cleanup.service.ts](file://apps/backend/src/storage/media-cleanup.service.ts)
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [signed-url.service.ts](file://apps/backend/src/storage/signed-url.service.ts)

## Conclusion
The media management system provides a robust, extensible foundation for handling media assets across diverse storage backends. Its layered design, strong abstraction over storage, and comprehensive metadata and optimization pipelines enable scalable performance and reliable CDN integration. Proper indexing, caching, and streaming strategies ensure efficient operation even with large media libraries.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices
- API Endpoints: Refer to controllers for endpoint definitions and request/response schemas.
- Configuration: Review environment variables for storage backends and CDN settings.
- Migrations: Inspect Prisma schema for entity definitions and relationships.

[No sources needed since this section provides general guidance]