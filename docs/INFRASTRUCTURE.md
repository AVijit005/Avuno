# Infrastructure

## VPS
NOT VERIFIED FROM REPOSITORY
- The repository does not contain verifiable server configurations, reverse proxy configs (e.g. NGINX), or health checks to define the VPS role or OS.

## Cloudflare
NOT VERIFIED FROM REPOSITORY
- Mentions of Cloudflare exist in code comments and S3/R2 storage services (e.g. `s3-storage.service.ts`).
- DNS, CDN, Tunnel, or Worker configurations are not verifiable directly from the repository source code.

## Production Topology
*(Illustrative only, based on typical stack - Not strictly verified)*
- Users connect via Cloudflare (CDN/Proxy)
- VPS hosts Frontend (Static/SSR) and Backend API (Node)
- PostgreSQL Database (hosted or managed)
