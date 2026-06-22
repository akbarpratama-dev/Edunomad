# EduNomad

Project collaboration platform connecting **Beginners**, **Seniors**, and **UMKM** through real-world projects — real project experience, mentorship, and verified portfolio artifacts.

This is **not** a freelance marketplace, job board, social network, LMS, or e-learning platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| Backend | Express.js, TypeScript |
| ORM | Prisma |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (JWT) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Architecture | Modular Monolith (Route → Controller → Service → Repository → Prisma) |

## Monorepo Structure

```
edunomad/
├── frontend/       # Next.js app
├── backend/        # Express.js API
├── docs/           # Project specifications (PRD, ERD, DB Schema, API Spec, RBAC, UI Spec)
├── memory/         # Development session memory
└── task-breakdown.md
```

## Getting Started

```bash
npm install

# Run backend (port 3001)
npm run dev:backend

# Run frontend
npm run dev:frontend
```

## Documentation

See `/docs` for full specifications. See `CLAUDE.MD` for development operating rules.
