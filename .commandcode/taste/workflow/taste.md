# workflow
- When writing task prompts or remediation plans, frame assertions about current code state as verification-first instructions ("check if X exists; if so, fix it; if not, skip and report") rather than direct fix commands. Confidence: 0.88
- After an automated executor (Antigravity or similar) reports back, independently verify their claims by reading the actual source files rather than trusting the report at face value. Confidence: 0.88
- Run 'npx tsc --noEmit' after each phase of refactoring to verify TypeScript compilation. Confidence: 0.85
- When the user asks you to fix pre-existing TypeScript errors before continuing, solve all of them immediately — don't dismiss them as "pre-existing" and move on. Confidence: 0.75
- Before implementing a new feature or capability, verify what existing infrastructure already exists (theme classes, CSS variables, utility modules) to avoid duplicating work. Confidence: 0.60
- When debugging a broken system (startup failure, connection issues, crashes), perform full root-cause analysis before modifying any files — do not fix code, edit config, or change .env until diagnosis is complete and user approves the fix plan. Confidence: 0.80
- Never declare "all bugs fixed" or "no issues remain" without running comprehensive verification first — passing a build alone does not prove correctness; verify with audits, grep for known issue patterns, and confirm each category of fixes independently before making sweeping claims. Confidence: 0.75
