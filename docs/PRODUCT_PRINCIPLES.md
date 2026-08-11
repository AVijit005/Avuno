# Chronicle - Product Principles

## Core Semantic Distinctions
Avuno is built on strict definitions of user experience.
1. **Journal**: "The chronological record of what I wrote." (Raw, chronological, user-authored)
2. **Timeline**: "A system-recorded chronicle." (Factual, auto-generated events)
3. **Media**: "The canonical creative work involved." (The movie, book, game itself)
4. **Memory**: "An experience I explicitly chose to preserve." (Curated, user-owned artifact)

## The "Truth-First" Mandate
Memories are NOT AI-generated summaries. They are NOT analytics cards. They are NOT duplicates of Journals.
A Memory requires an explicit user action to create.
The backend database enforces this with a CHECK constraint: A Memory can optionally be linked to ONE source of evidence (e.g., journalId OR quoteId), but never both, and never falsified.

## No AI (For Now)
We do not use LLMs to summarize thoughts, build the "Memory Graph", or generate fake reflections. AI integration is explicitly DEFERRED to later phases.
