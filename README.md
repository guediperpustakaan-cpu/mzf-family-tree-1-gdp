# Silsilah Keluarga — Extended Family Tree

A full-stack extended family tree application ("untuk semua umur") with authentication,
a polished dashboard, full CRUD for people/relationships/documents, a visual generational
tree, and persistent PostgreSQL storage on Neon.

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — modern, responsive UI
- **Prisma ORM** + **Neon PostgreSQL** (serverless Postgres)
- **NextAuth.js** (credentials provider, JWT sessions, bcrypt hashing)
- **SWR** — data fetching with optimistic updates
- **lucide-react** — icon set

## Features

- **Authentication** — login required for all data; unauthenticated requests return 401.
- **Dashboard** — stat cards, age distribution chart ("untuk semua umur"), upcoming
  birthdays, recent members, document breakdown.
- **People** — searchable/filterable grid, create/edit/delete, detail page showing
  parents, spouses, children, and linked documents.
- **Family Tree** — interactive **graph view** of the family tree: nodes laid out by
  generation, orthogonal SVG connectors from parents down to sibling bars, heart links
  between spouses. Drag to pan, scroll to zoom, click any node to open that person's
  profile. A **Senarai** toggle shows the same tree as per-generation card grids.
- **Relationships** — link parent→child and spouse; delete with confirmation.
- **Documents** — store birth/marriage/death certificates, ID cards, photos, letters;
  search, filter by type, link to a person.
- **UX polish** — empty states, loading skeletons, toast notifications, optimistic
  deletes, responsive layout with mobile sidebar.
- **Neon resilience** — `withRetry()` in `src/lib/prisma.ts` retries transient
  connection errors (`P1001`, `P1002`, …) that occur when the serverless pooler drops
  an idle connection.
- **Seeded demo data** — 21 people across 4 generations, 31 relationships, 22 documents.

## Demo Accounts

| Role   | Email                 | Password      |
| ------ | --------------------- | ------------- |
| Admin  | admin@familytree.my   | password123   |
| Member | member@familytree.my  | password123   |

## Getting Started

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL & NEXTAUTH_SECRET
npx prisma generate
npx prisma db push          # create schema on Neon
npm run db:seed             # seed demo data
npm run dev                 # http://localhost:3000
```

## Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start dev server                     |
| `npm run build`   | Production build                     |
| `npm run start`   | Start production server              |
| `npm run lint`    | Run ESLint                           |
| `npm run db:seed` | Seed demo family data into Neon      |

## Project Structure

```
prisma/
  schema.prisma     # Person, Relationship, Document, User models
  seed.js           # realistic multi-generational demo data
src/
  app/
    (dashboard)/    # protected routes: dashboard, people, tree, documents, relationships
    api/            # REST-ish route handlers (people, documents, relationships, stats)
    login/          # auth page
  components/
    layout/         # sidebar + topbar
    ui/             # button, card, modal, skeleton, empty-state, toast
    people/         # person form modal
  lib/              # prisma client, auth config, utils
```

## Data Model

- **Person** — name, gender, life status, birth/death dates & places, occupation, bio,
  contact info.
- **Relationship** — `PARENT_CHILD` or `SPOUSE`, linking two people (unique per pair).
- **Document** — type (birth/marriage/death certificate, ID, photo, letter, other),
  issuing authority, reference number, notes, optional file URL, optional person link.
- **User** — email/password (bcrypt), name, role.
