# workflow
- Do not commit generated analysis/audit markdown files (e.g., FRONTEND_BUGS_ANALYSIS.md, IMPLEMENTATION_PLAN.md) to the repository — they are ephemeral working documents. Confidence: 0.80
- Never push code to a remote repository without the user's explicit permission. This wastes CI/CD builds and can break the production site without the user's consent. Use `git commit` locally, but confirm before `git push`. Confidence: 0.95
- The production build (Cloudflare)` tree-shakes unused imports. An unused import causes the bundler to remove the function, making it unavailable to other files that reference it. Always ensure every imported function is actually used in the importing file, or else any other file calling it will throw `ReferenceError` in production. Confidence: 0.90
- When fixing a complex auth error that resists multiple targeted fixes, revert to the last known working implementation rather than continuing to patch the broken one. Confidence: 0.80
- Run 'npx tsc --noEmit' after each phase of refactoring to verify TypeScript compilation. Confidence: 0.85
- When the user asks you to fix pre-existing TypeScript errors before continuing, solve all of them immediately — don't dismiss them as "pre-existing" and move on. Confidence: 0.75
- Before implementing a new feature or capability, verify what existing infrastructure already exists (theme classes, CSS variables, utility modules) to avoid duplicating work. Confidence: 0.60
- When debugging a broken system (startup failure, connection issues, crashes), perform full root-cause analysis before modifying any files — do not fix code, edit config, or change .env until diagnosis is complete and user approves the fix plan. Confidence: 0.80
- When the user explicitly asks for analysis/verification only, stay in read-only diagnostic mode — do not modify any files, do not propose fixes, do not take corrective action, just analyze and report findings. Confidence: 0.70
