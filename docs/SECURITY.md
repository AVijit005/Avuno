# Security Overview — Chronicle Backend v1.0.0

## Authentication

- **JWT access tokens** — Signed, short-lived (15 min default)
- **Refresh tokens** — Rotation on every use, httpOnly cookies
- **Password hashing** — Argon2id (OWASP recommended)
- **OAuth** — Google OAuth 2.0 with verified email enforcement
- **Email verification** — Token-based with expiry

## Authorization

- **JwtAuthGuard** — Protects all authenticated endpoints
- **Ownership validation** — Every operation checks user.id matches resource owner
- **DTO-based responses** — Only explicitly mapped fields are returned

## Data Protection

- **SQL injection** — Prevented by Prisma parameterized queries
- **Mass assignment** — Prevented by DTO whitelisting
- **Sensitive fields** — Passwords, tokens never exposed in API responses
- **File upload** — MIME type and size validation before processing

## Transport Security

- **Helmet** — Sets security headers (CSP, XSS, X-Frame, HSTS)
- **CORS** — Restricted to configured frontend origin
- **Compression** — Enabled but not applied to encrypted content
- **Cookies** — httpOnly, SameSite=Lax, Secure in production

## Recommended Additions

1. Install \`@nestjs/throttler\` for rate limiting
2. Add database read replicas
3. Enable SQL query logging in production (debug only)
4. Regular dependency audits: \`npm audit\`
5. Penetration testing before major releases
