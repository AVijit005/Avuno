---
kind: dependency_management
name: Bun-based Monorepo Dependency Management with Supply-Chain Guarding
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - bun.lock
    - bunfig.toml
    - .npmrc
    - apps/backend/package.json
    - apps/backend/bun.lock
---

The Chronicle Personal Memory Operating System uses **Bun** as its package manager across a monorepo that contains a TanStack Start/Vite frontend and a NestJS backend. Dependencies are declared in `package.json` files at the root (`apps/backend/package.json`) and locked via `bun.lock` lockfiles, which are committed to version control for reproducible builds.

**Package manager and toolchain**: Bun is used for dependency resolution and installation. The root `bunfig.toml` configures a supply-chain safety policy: `minimumReleaseAge = 86400` seconds (24 hours) blocks installation of packages published within the last day, preventing accidental pulls of freshly published, potentially malicious or broken versions. A whitelist under `minimumReleaseAgeExcludes` allows specific Lovable.dev packages to bypass this guard after manual confirmation.

**Lockfile strategy**: Both the root and `apps/backend/` directories maintain `bun.lock` lockfiles that pin exact resolved versions and checksums for every transitive dependency. This ensures deterministic installs across CI, local development, and production environments.

**Workspace structure**: The project is structured as a two-package setup — the root package (`avuno`, private) for the frontend and `@avuno/backend` for the NestJS server. Each has its own `package.json` with clearly separated `dependencies` and `devDependencies`. There is no npm/yarn workspaces configuration; each package manages its own dependency tree independently.

**Peer dependency handling**: The `.npmrc` file sets `legacy-peer-deps=true`, which relaxes peer dependency resolution conflicts — a pragmatic choice that avoids breaking changes when upgrading dependencies with conflicting peer requirements.

**Versioning conventions**: Dependencies use caret (`^`) ranges for minor/patch updates, allowing automatic security patches while avoiding breaking changes. Some critical dev tools like `vite-plugin-pwa` use exact versions where compatibility is tight. The `overrides` field in the root `package.json` forces `vite-plugin-pwa` to use the same `vite` version as the workspace to prevent version drift.

**Engine constraints**: The backend explicitly declares `engines.node >= 22.0.0`, ensuring runtime compatibility. No similar engine constraints exist at the root frontend package.

**No vendoring or private registries**: All dependencies are pulled from the public npm registry. There is no vendoring strategy, no `.npmrc` registry configuration beyond peer deps, and no private package registry setup.