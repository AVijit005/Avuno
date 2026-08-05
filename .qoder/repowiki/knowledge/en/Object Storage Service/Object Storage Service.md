---
kind: external_dependency
name: Object Storage Service
slug: aws-s3-cloudflare-r2
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
---

### Object Storage Service
- **Role**: File storage for user uploads, media assets, and generated content
- **Providers**: Supports both AWS S3 and Cloudflare R2 through unified interface
- **Configuration**: Endpoint, region, bucket name, and access credentials via environment variables
- **Modes**: Local filesystem for development, cloud storage for production