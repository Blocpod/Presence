# PRESENCE operating guide

Read docs/MISSION.md, STATE.md, and ARCHITECTURE.md before significant changes. Preserve the central chain: authorization → governed interaction → isolated memory → sandbox metering → creator control. Use fictional adult identities only. Never remove AI disclosure or introduce real charges. No secrets in git. External providers require explicit configuration; deterministic demo mode must work without credentials.

Use evidence-driven loops and record results in docs/BUILD-LOG.md. Run typecheck, lint, tests and build plus browser journeys before release. Independently review security and UX with subagents when useful. Clearly distinguish implemented behavior, seeded examples, projections, and future integrations. Do not claim verified real identity or deployed production security in the local demo.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
