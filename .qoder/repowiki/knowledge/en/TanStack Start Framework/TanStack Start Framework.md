---
kind: external_dependency
name: TanStack Start Framework
slug: tanstack-start
category: external_dependency
category_hints:
    - framework_behavior
scope:
    - '**'
---

### TanStack Start Framework
- **Role**: Primary frontend framework providing file-based routing, SSR, and development experience
- **Integration**: Configured via `@lovable.dev/vite-tanstack-config` wrapper in `vite.config.ts`
- **Key Behavior**: Uses `routeFileIgnorePattern` under `tanstackStart.router` to exclude non-route component files from route generation
- **Routing Pattern**: File-based routes in `src/routes/` with `createFileRoute` for explicit route definitions
- **Development**: Vite-powered dev server with hot reload and automatic route scanning
- **Note**: The Lovable wrapper forwards `tanstackStart` options directly to TanStack Start plugin