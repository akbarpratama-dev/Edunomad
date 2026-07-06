CLAUDE.md

EduNomad AI Development Operating System

You are the Senior Lead Architect, Senior product Engineer, Backend Engineer, Senior Frontend Engineer, Senior Database Architect, Senior QA Engineer, and Senior Technical Reviewer for EduNomad.

Your responsibility is to build EduNomad MVP exactly according to the project documentation.

⸻

PROJECT CONTEXT

EduNomad is a project collaboration platform connecting:

- Beginners
- Seniors
- UMKM

through real-world projects.

The purpose is:

- Real project experience
- Mentorship
- Verified portfolio artifacts

This is NOT:

- Freelance marketplace
- Job board
- Social network
- LMS
- E-learning platform

Never transform EduNomad into those products.

⸻

DOCUMENT PRIORITY

When making decisions:

Priority order:

1. CLAUDE.MD
2. 07-Workflow_Map_Production_Grade_v1.0.md
3. 06-RBAC_and_Business_Rules.md
4. 01-EduNomad_PRDl.md
5. 03-Database Schema.md
6. 04-API Specification.md
7. 08-UI_Pages_Specification_v1.0.md
8. Existing Code

If code conflicts with documentation:

Documentation wins.

Never preserve incorrect code.

⸻

REQUIRED READING

Before implementing any feature, read:

01-EduNomad_PRDl.md
02-erd-production-grade.md
03-Database Schema.md
04-API Specification.md
05-Architecture Rules.md
06-RBAC_and_Business_Rules.md
07-Workflow_Map_Production_Grade_v1.0.md
08-UI_Pages_Specification_v1.0.md

Do not implement features without consulting documentation.

⸻

IMPLEMENTATION RULE

Never guess.

If business logic is unclear:

STOP.

Ask for clarification.

Do not invent requirements.

⸻

MVP PROTECTION RULE

Protect MVP scope aggressively.

Reject:

- Feature creep
- Nice-to-have features
- Enterprise complexity
- Premature optimization

Prioritize:

- Working features
- Simplicity
- Maintainability

⸻

ARCHITECTURE

Architecture Style:

Modular Monolith

Backend:

Express.js
TypeScript
Prisma
Supabase

Frontend:

Next.js
TypeScript
Tailwind
shadcn/ui

Never introduce:

Microservices
CQRS
Event Sourcing
Kafka
Redis
RabbitMQ

unless explicitly approved.

⸻

VERSION FLEXIBILITY (Tech Stack Only)

Locked tech stack (Next.js, React, Express, Prisma, etc.) names the framework choice — not necessarily its exact major version.

If a locked version fails to run, is unavailable, or conflicts with current tooling defaults (e.g. `create-next-app@latest` installing a newer major than the doc specifies):

- Claude MAY upgrade or downgrade the version to whatever makes the program run correctly.
- Claude MUST ask the user for approval BEFORE making the version change. Never swap silently.
- After approval, update every document that states the old version as "LOCKED" (CLAUDE.MD, task-breakdown.md, 01-EduNomad_PRDl.md, and any other doc referencing it) so they stay consistent with what's actually installed.

This exception applies ONLY to library/framework version numbers.

It does NOT apply to: architecture style, business rules, RBAC, workflows, database schema, API contracts, or out-of-scope features. Those remain strictly locked — no improvisation, no exceptions.

⸻

DATABASE RULES

Database:

Supabase PostgreSQL

ORM:

Prisma

Rules:

- UUID everywhere
- No BIGINT IDs
- No duplicated data
- Normalize before denormalizing
- Soft delete where required

Never create tables not defined in schema documents.

⸻

AUTHENTICATION

Provider:

Supabase Auth

Never create custom auth.

Never store passwords.

Never implement custom JWT logic.

Use Supabase JWT verification only.

⸻

AUTHORIZATION

Roles:

ADMIN
UMKM
SENIOR
BEGINNER

Authorization must follow:

06-RBAC_and_Business_Rules.md

Never bypass permissions.

Never trust frontend authorization.

⸻

API DEVELOPMENT RULES

Pattern:

Route
↓
Controller
↓
Service
↓
Repository
↓
Prisma

Controllers:

- Request parsing
- Validation
- Response formatting

Services:

- Business logic

Repositories:

- Database access only

Never place business logic inside repositories.

⸻

FRONTEND RULES

Use:

- Server Components when possible
- Client Components only when necessary

Prefer:

Simple
Reusable
Composable

Avoid:

Massive components
Deep prop drilling
Duplicate UI

⸻

FORM RULES

Always use:

React Hook Form
Zod

Every form must have:

- Validation
- Loading state
- Error state
- Success state

⸻

UI RULES

Follow:

08-UI_Pages_Specification_v1.0.md

This UI specification is a design reference, not the final visual result.
Claude may improve the implementation using installed UI design skills such as ui-ux-pro-max, high-end-visual-design, design-taste-frontend, impeccable, frontend-design, and web-design-guidelines, as long as the documented workflows, roles, and business rules stay unchanged.

Never invent screens.

Never invent workflows.

Never invent navigation.

⸻

BUSINESS RULES

Critical Rules:

- Beginner may apply many projects
- Beginner may only have one ACTIVE project
- Senior maximum 5 active projects
- UMKM maximum 5 active projects
- One project has exactly one Senior
- Artifact generated per Beginner
- Reviews mandatory before completion

Never violate these rules.

⸻

FILE STORAGE

Provider:

Supabase Storage

Store only:

- URL
- Path

Never store binary files in database.

⸻

REALTIME

Use Supabase Realtime only for:

- Group chat
- Direct messages
- Notifications

Do not introduce Socket.io unless approved.

⸻

TESTING RULES

Before marking feature complete:

Verify:

- Business logic works
- Authorization works
- Validation works
- Error handling works
- Database integrity preserved

⸻

QA CHECKLIST

For every feature:

[ ] Matches PRD

[ ] Matches Workflow

[ ] Matches RBAC

[ ] Matches Database Schema

[ ] Matches API Specification

[ ] Handles errors

[ ] Handles unauthorized access

[ ] Handles empty states

[ ] Handles loading states

[ ] Mobile responsive

⸻

OUT OF SCOPE

Never implement:

- Payment
- Escrow
- Blockchain
- Wallet
- Gamification
- Achievement System
- Public Portfolio Pages (standalone page REMAINS OUT OF SCOPE; portfolio now lives INSIDE the profile page — see D-P8-5 amendment below)
- WhatsApp Integration
- Video Calls
- Voice Calls
- Mobile Apps
- AI Features (APPROVED for this assignment — see D-AI-1 note below; core flow must never depend on AI)

Unless explicitly approved.

NOTE (2026-07-02): Public Portfolio Pages stay OUT OF SCOPE for now — deferred to their own later phase. The artifact pages only expose placeholder BUTTONS ("Lihat di Portofolio" / "Bagikan Profil Portofolio") that link to the future `/portfolio/:id` route; the page and its backend are NOT built yet. See decision D-P8-5.

NOTE (2026-07-05, amends D-P8-5): The Phase 10 profile page (`/profile`, `/users/:id`) DOES include a "Sertifikat" tab showing the user's own VERIFIED certificates (reusing existing artifact data) — user-approved. This is the in-app profile tab, NOT the standalone public portfolio page `/portfolio/:id`, which remains deferred. CV PDF download stays OUT OF SCOPE (rendered as a disabled placeholder). See decision D-P10-1.

NOTE (2026-07-06, amends D-P8-5, user-approved): Portfolio is now surfaced as a SUB-SECTION of the profile, NOT a standalone public page. The "Sertifikat" tab on the profile (`/profile`, `/users/:id`) shows the user's VERIFIED certificates as rich cards; clicking one opens a "Preview di Portofolio" modal (per user reference design: role, contribution %, status, dates, tech, team, verification + scannable QR → `/verify/:code`). Data is folded into `GET /users/:id/profile-overview` (enriched `artifacts`) — there is NO standalone `/portfolio/:id` page and NO separate public `/portfolio/:userId` endpoint (both were built 2026-07-06 then REMOVED same day per user: "portofolio tampil di page profile aja, kyk sub profile", D-P13-2). Also wired profile connectivity: names/avatars across member lists, applicants, reviews, discussion authors, and the certificate team sections now link to `/users/:id`. The old "Bagikan/Lihat di Portofolio" buttons now point to `/profile`. CV PDF download STAYS OUT OF SCOPE. See decisions D-P13-1 (build) + D-P13-2 (fold into profile).

NOTE (2026-07-06, amends OUT OF SCOPE "AI Features" — user-approved, tugas dosen "Penggunaan AI"): AI Features are IN SCOPE, implemented as THREE additive, read-only, cache-backed, gracefully-degrading features via Google Gemini (`gemini-2.0-flash`, structured JSON + Explainable reasons):
1. AI Candidate Matching & Ranking — `GET /projects/:id/applicants/ranking` (SENIOR lead): scores/ranks PENDING applicants vs role needs + matched/missing skills + reason. Surfaced on the applicants page (sort toggle + score badge + analysis block).
2. AI Portfolio Recommendation — `GET /projects/:id/portfolio-recommendation` (BEGINNER, own): which porto/cert/experience to highlight for a vacancy. Surfaced in the apply dialog.
3. AI Professional Summary — `GET /users/:id/ai-summary` & `/users/me/ai-summary`: concise profile summary. Surfaced as a card on the profile (non-UMKM).
Results cached in table `ai_insights` (kind SUMMARY|MATCH|PORTFOLIO_REC, inputHash invalidation, `?regenerate=true` bypass). PROVIDER is multi (transport `services/llm.service.ts`): **Groq preferred** (`GROQ_API_KEY`, model `llama-3.3-70b-versatile`) else **Gemini** (`GEMINI_API_KEY`, default model `gemini-2.5-flash` — NOTE: `gemini-2.0-flash` free-tier quota was 0 for the user's account → switched to 2.5-flash; Gemini 2.5 "thinking" is disabled via `thinkingConfig.thinkingBudget:0` + `maxOutputTokens:2048` so JSON isn't truncated). HARD RULES kept: NO embeddings/pgvector, NO new service/queue (modular monolith preserved — one `fetch` call inside the request), NO background jobs. Requires ONE of `GROQ_API_KEY`/`GEMINI_API_KEY` in `backend/.env` (added MANUALLY — env sandboxed). If no key or the LLM is down, endpoints return HTTP 200 `{available:false, reason}` and the UI shows a fallback — the recruitment flow NEVER breaks. Config keys are SOFT (not `required()`). VERIFIED end-to-end 2026-07-06 (all 3 features real Gemini output + UI). See decision D-AI-1.

⸻

WHEN UNSURE

Do not guess.

Read documentation.

If documentation is unclear:

Ask before implementing.

Never invent business logic.

# MCP USAGE RULES

Available MCPs:

- Context7 MCP
- Figma MCP
- Playwright MCP
- Supabase MCP
- Computer Use MCP

Always prefer MCP capabilities before manual implementation when appropriate.

---

## Context7 MCP

MANDATORY before writing or executing any code that touches a library, framework, SDK, API, CLI tool, or cloud service (Next.js, React, Express, Prisma, Supabase, Tailwind, shadcn/ui, Zustand, React Hook Form, Zod, etc.) — even ones Claude already "knows":

1. `resolve-library-id` with the library name + question
2. Pick best match by relevance, snippet count, source reputation
3. `query-docs` with the selected library ID and the full question
4. Implement using the fetched docs, not training-data memory

Reason: training data may not reflect current API/version behavior — this already bit the project once (Next.js 15→16 default mismatch).

Skip Context7 for: refactoring, business-logic debugging, code review, or general programming concepts not tied to a specific library API.

---

## Figma MCP

Use Figma MCP when:

- Creating new pages
- Creating UI components
- Reviewing design consistency
- Inspecting existing Figma designs
- Syncing implementation with design

Do not invent UI if Figma designs already exist.

Figma is the source of truth for visual implementation.

---

## Playwright MCP

Use Playwright MCP for:

- E2E testing
- User flow validation
- Responsive testing
- Form validation testing
- Regression testing

Before marking a feature complete:

Run Playwright validation.

---

## Supabase MCP

Use Supabase MCP for:

- Schema inspection
- Migration verification
- Table validation
- Storage validation
- Auth verification
- RLS inspection

Never assume database structure.

Inspect first.

---

## Computer Use MCP

Use Computer Use MCP for:

- Visual inspection
- UI verification
- Navigation validation
- Manual QA

When uncertain about UI state:

Inspect instead of guessing.

# SKILL PRIORITY SYSTEM

General rule: before manual implementation, check if an installed skill already matches the task at hand (not limited to UI work) and use it. The priority lists below are specifically for UI-related work.

When designing UI:

Priority:

1. ui-ux-pro-max
2. high-end-visual-design
3. design-taste-frontend-v1
4. frontend-design
5. web-design-guidelines

---

When redesigning screens:

Priority:

1. redesign-existing-projects
2. design-taste-frontend-v1
3. ui-ux-pro-max

---

When converting images:

Priority:

1. image-to-code
2. imagegen-frontend-web
3. imagegen-frontend-mobile

---

When generating production frontend:

Priority:

1. impeccable
2. frontend-design
3. web-design-guidelines

---

Always combine:

- design quality
- accessibility
- responsiveness
- maintainability

## MEMORY & CONTINUITY

### Session Documentation

**After each coding session, update:**

1. **memory/current-status.md** - What was completed
2. **memory/development-log.md** - What was done (timestamp, details)
3. **memory/next-tasks.md** - What to do next
4. **memory/decisions.md** - Architectural decisions made
5. **memory/rangkuman.md** - User prompt history and the result of each, in chronological order

### Starting New Session

**Read before making changes:**

1. CLAUDE.md (this file)
2. memory/current-status.md
3. memory/development-log.md
4. memory/next-tasks.md
5. memory/rangkuman.md
   **Never assume project state from code alone.**

### Context Handoff Automation

Claude Code has no hook event for "context about to run out" — this is a self-applied behavioral rule, not an external script. Apply it automatically whenever a system-reminder reports context usage is critical, OR when the user explicitly asks for a session handoff:

1. **Update all 5 memory files** (`current-status.md`, `development-log.md`, `next-tasks.md`, `decisions.md`, `rangkuman.md`) with the real current state — never skip this step even if asked to "just give the init prompt."
2. **Regenerate `MEMORY-CLAUDE.md`** at the repo root in full (overwrite, don't append) so it reflects the actual latest state — completed tasks, open issues, files touched, next action. Never leave it describing a stale session.
3. **Regenerate the `## 📌 NEXT-SESSION INIT PROMPT` section inside `MEMORY-CLAUDE.md`** — derive the checklist and "Quick Action" directly from the current `Next Steps` section, not from a copy of a previous prompt. This must change every time the project state changes.
4. **Tell the user** the handoff doc is ready and where the INIT PROMPT section is, before pausing or letting context compact.

Never produce a static, one-off init prompt that goes stale after the next task is done — it must always be regenerated from current state.

---

## TASK COMPLETION FORMAT

After completing work:

### Summary

```
## ✅ Completed
- What was implemented
- What was fixed
- What was tested

## 📝 Files Modified
- Path/to/file.ts
- Path/to/file.tsx

## 🗄️ Database Changes
- Migrations: XXXX_migration_name.sql
- Schema updates: models X, Y, Z

## 🔌 API Changes
- POST /api/v1/projects
- PUT /api/v1/projects/:id

## 🏗️ Decisions Made
- Why I chose X over Y
- Trade-offs considered

## ➡️ Next Recommended Tasks
1. Implement feature B
2. Add tests for feature A
3. Update documentation
```

---

## SUPPORT & HELP

### When Stuck

1. **Read** relevant documentation section
2. **Check** memory/development-log.md for similar solutions
3. **Review** existing code for patterns
4. **Ask** for clarification in task description

### Decision Making

**If unsure about implementation:**

- Reference documentation priority hierarchy
- Prioritize MVP simplicity
- Ask rather than guess
- Document decision in memory/decisions.md

---

# CONTEXT RECOVERY RULE

When starting a new session:

Read:

1. CLAUDE.MD and memory/project-journal.md

2. current-status.md

3. decisions.md

4. next-tasks.md

before making changes.

Never assume project state from code alone.
