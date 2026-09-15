# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

BureauOS is a compliance orchestration system for Nigerian businesses (tracks statutory obligations across CAC, FIRS, ITF, etc.). This repo is the backend API, currently pre-launch — powering the waitlist, blog, and email infrastructure while the core compliance product is built. See `/Users/mac/Documents/U-apps/BureauOS/CLAUDE.md` for workspace-level layout shared with `bureau-landing-page`.

## Commands

- Dev server (watch, port 4000): `npm run start:dev`
- Production: `npm run build` then `npm run start:prod`
- Lint / format: `npm run lint`, `npm run format`
- Tests: `npm run test`; single file: `npm run test -- waitlists.service.spec.ts`; coverage: `npm run test:cov`; e2e: `npm run test:e2e`
- Prisma (never edit `prisma/schema.prisma` directly — it's generated):
  - `npm run prisma:merge` — concatenates each module's `src/<module>/models/*.prisma` into `prisma/schema.prisma`
  - `npm run prisma:generate` — merge + `prisma generate`
  - `npm run prisma:migrate` — merge + `prisma migrate dev`
  - `npm run prisma:studio`
- `npm run deploy` — full bootstrap: generate + migrate + seed (`prisma db seed`, seeds email templates)
- `npm run bootstrap` — first-run only; interactively creates the admin account and prints a one-time plaintext API Gateway Key (copy to frontend's `VITE_API_GATEWAY_KEY`)

Requires Node 22 (LTS). Swagger UI at `http://localhost:4000/docs`, gated by HTTP Basic Auth (`SWAGGER_USER`/`SWAGGER_PASSWORD`).

## Architecture

Module map (each is self-contained: controllers, services, own `models/*.prisma`):

```
src/
├── core/                # database (PrismaService + BaseDatabaseService), api-gateway,
│                         # audit-logs, upload (S3), pagination, utils, config
├── iam/                  # JWT + Passport auth, OTP, password reset
├── accounts/             # multi-tenant account model (ADMIN/BUSINESS/PROFESSIONAL)
├── users/                # user profiles and credential hashing
├── waitlists/             # waitlist submission, segmentation, drip campaigns
├── blog/                  # blog post publishing
├── document-hub/          # document storage and proceedings
└── email-managements/     # DB-driven Handlebars email engine + CRUD
```

### Database service layer

Every module's DB access goes through a `*DbService` extending `BaseDatabaseService` (`src/core/database/base.db.service.ts`) rather than injecting `PrismaService` directly into business logic. Each subclass declares:
- `fillable: string[]` — explicit mass-assignment whitelist for create/update
- `searchable: string[]` — fields exposed to filter queries
- `relations: string[]` — default eager-loaded relations

The base provides soft-delete-aware CRUD (`deletedAt: null` on reads; `delete()` soft-deletes, `forceDelete()` hard-deletes) and `findAll()` returns `[data[], totalCount]` for `PaginationInterceptor`. The base class uses `any` for the model type deliberately — concrete services provide real types where it matters; this trades base-layer type safety for avoiding complex generic gymnastics across Prisma's generated types.

### Waitlist: submission → segmentation → drip campaign

Not a simple email collector — three services coordinate:
- **`WaitlistsService`** (`POST /api/v1/waitlists`): rejects duplicate emails (409), calls the segmentation engine, persists with segment tags and `step = 1`, fires a non-blocking `waitlist-welcome` email, writes a fire-and-forget audit log.
- **`WaitlistsSegmentationService`**: pure/stateless/synchronous rule engine — no DB access, easy to unit test. Segments: `ng_uk_founder`, `qatar_interested`, `ecosystem_partner`, `local_focus`. A submission can match multiple segments and receives all applicable sequences.
- **`WaitlistsOrchestrationService`**: `@Cron(CronExpression.EVERY_HOUR)` job that advances each subscriber through their segment's `SEGMENT_SEQUENCES` steps once `Date.now() - lastSent >= maxDelayDays`. Per-template errors are caught and logged without skipping the step increment. Known limitation: not safe across multiple API instances (no distributed lock) — needs gating to a single instance or migration to a real queue (e.g. BullMQ) before horizontal scaling. Drip templates referenced in `SEGMENT_SEQUENCES` must exist in the DB (seeded via `npm run deploy`) before the orchestrator runs.

### Email engine

Templates are DB rows (`slug`, `subject`, Handlebars `body`), not hardcoded — content can be updated by reseeding without a deploy. `EmailManagementsService.sendMail(to, slug, data)` fetches the template (404 if missing — treated as a deployment error, not a silent failure), compiles `body` as Handlebars against `data`, wraps it in the shared `layout.hbs`, sends via Nodemailer.

### API Gateway vs JWT

Public-facing routes (e.g. the frontend waitlist form) are protected by `ApiGatewayGuard`, which validates `x-api-key` against the `ApiGateway` table and attaches the record to `request.gateway` — used instead of JWT since external clients have no user session. Internal dashboard routes use JWT (`BearerTokenGuard`). Gateway keys are masked to their last 4 characters on every response after creation (`ApiGatewayService.sanitizeGateway()`); the plaintext key is shown exactly once, during `npm run bootstrap`.

### Auth flow specifics

`AuthenticationService` uses `@nestjs/passport` with `LocalStrategy` (login) and `JwtStrategy` (bearer routes). Access tokens are short-lived; refresh tokens are long-lived, bcrypt-hashed as `hashedRt` on the user record, rotated on use, and revoked on logout by nulling `hashedRt`. OTP/password-reset use `VerificationCode` rows with `expiresAt` + `completed`; completing one invalidates all previous pending codes of the same type via `updateMany` before creating the new record.

### URI versioning

Controllers are explicitly versioned (`@Controller({ path: 'waitlists', version: '1' })`), global default `v1`, global prefix `api` (excludes `/`). All live routes resolve to `/api/v1/...`. New versions can be added alongside old ones for zero-downtime deprecation.

### Prisma schema fragmentation (Prismix)

Each module owns `src/<module>/models/*.prisma`. `scripts/prisma-merger.js` concatenates these into `prisma/schema.prisma` before any Prisma command — keeps model definitions co-located with their domain module. Always run through the `prisma:*` npm scripts, never `npx prisma` directly, or the merge step is skipped and `schema.prisma` goes stale.

## Known technical debt

- Sentry is stubbed out in `HttpExceptionFilter`; needs `@sentry/node` + `SENTRY_URL`.
- Drip campaign cron (`WaitlistsOrchestrationService`) is not safe across multiple API instances.
- Waitlist admin endpoints are gated only by API key; a `RoleGuard` distinguishing `BUSINESS` vs `ADMIN` is needed before multi-tenant access opens up.
