---
kind: external_dependency
name: Redis Cache & Queue
slug: redis
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
---

### Redis Cache & Queue
- **Role**: In-memory data store for caching, sessions, and job queuing
- **Integration**: BullMQ for background job processing
- **Configuration**: Host, port, password, and database selection via environment variables
- **Usage**: Shared across all application instances for distributed caching