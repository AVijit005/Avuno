# architecture
- For all new implementation work, start with a shared types package before connecting frontend to backend. Confidence: 0.70
- Delete ~97 dead/deprecated component files before adding new code. Confidence: 0.70
- Create a single canonical API client with React Query before connecting any frontend page to the backend. Confidence: 0.85

# database
- Fix the 45 redundant indexes on user-media junction tables (remove standalone `@@index([status])`, `@@index([favorite])`, `@@index([lastInteractionAt])` patterns). Confidence: 0.70
- Change cascade deletes from media entities to user junction tables to `Restrict` or `SetNull` to prevent data loss on media deletion. Confidence: 0.70
- Add `ON_HOLD` to DTO STATUS_VALUES array to match Prisma schema enum. Confidence: 0.80

# backend
- Never make endpoints that bypass the global exception filter with manual `res.status().json()`. Confidence: 0.70
- Always add ownership checks for storage deletion operations. Confidence: 0.70
- Add cursor pagination to `GET /collections` and `GET /shelves` before any frontend integration. Confidence: 0.70
- Create proper DTO validation classes for analytics, wrapped generate, and storage endpoints. Confidence: 0.70
- The NestJS build in this project outputs compiled JS to `dist/src/` not `dist/` directly — PM2 start command is `dist/src/main.js`, not `dist/main.js`. Confidence: 0.70

# frontend
See [frontend/taste.md](frontend/taste.md)

# typescript
- useReducedMotion() returns boolean | null — always use ?? false fallback before passing to components expecting boolean. Confidence: 0.70
- Replace dangerouslySetInnerHTML style blocks with CSS custom properties set via inline style prop. Confidence: 0.70
- Replace unsafe `as any` type casts with proper adapter functions that bridge incompatible types (e.g., RecentActivityItem → ContinueItem → UIMediaItem). Confidence: 0.70

# quality
- Apply "billion dollar SaaS" polish standard: every UI interaction needs proper hover/active/focus states, glass morphism with OkLCH glows, smooth transitions, and production-grade error/empty/loading handling. Confidence: 0.70

# analysis
- When analyzing code quality or planning work, do line-by-line source verification against the actual files — read every file mentioned, grep for key patterns, and independently verify claims rather than trusting summaries or planning documents. Confidence: 0.85

# prompts
- When writing prompts for autonomous executors (Antigravity or similar), be long, detailed, and verbose with specific file paths, exact line references, and concrete commands — the user explicitly prefers comprehensive output over concise. Confidence: 0.80
- Autonomous executor prompts must always include: (1) verification steps with specific grep/read commands to confirm results, (2) tests to write and run, (3) build/type-checks to pass, (4) exact git commit message and push command, (5) non-negotiable guardrails (no fake data, no force-push, no rewrite history). Confidence: 0.80
- When the user says they will hand a prompt to "another AI," make the prompt fully self-contained with all necessary context, file paths, and project background — the receiving AI will have no conversation history and must be able to understand and execute from the prompt alone. Confidence: 0.70

# planning
- When creating an implementation plan from an audit, include a verification summary table showing the audit's accuracy rate (confirmed vs false-positive claims), organize fixes into independently testable phases ordered by risk level, and append CI guard scripts (grep-based checks, build/type-check commands) at the end. Confidence: 0.75

# workflow
- Do not commit generated analysis/audit markdown files (e.g., FRONTEND_BUGS_ANALYSIS.md, IMPLEMENTATION_PLAN.md) to the repository — they are ephemeral working documents. Confidence: 0.80
- Run 'npx tsc --noEmit' after each phase of refactoring to verify TypeScript compilation. Confidence: 0.85
- When the user asks you to fix pre-existing TypeScript errors before continuing, solve all of them immediately — don't dismiss them as "pre-existing" and move on. Confidence: 0.75
- Before implementing a new feature or capability, verify what existing infrastructure already exists (theme classes, CSS variables, utility modules) to avoid duplicating work. Confidence: 0.60
- When debugging a broken system (startup failure, connection issues, crashes), perform full root-cause analysis before modifying any files — do not fix code, edit config, or change .env until diagnosis is complete and user approves the fix plan. Confidence: 0.80
