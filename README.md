# BureauOS

BureauOS is a compliance orchestration system for Nigerian businesses. It tracks statutory obligations across regulatory bodies — CAC, FIRS, ITF and others — automates deadline reminders, stores documents securely, and produces a real-time compliance score visible to founders, accountants, lawyers, and investors.

The problem it solves is structural: Nigerian startups and SMEs manage compliance across a fragmented landscape with no single system. The result is missed filings, ₦2M–₦10M in avoidable penalties over three years, documents that fail due diligence, and companies struck off the register for administrative lapses that a simple reminder would have prevented.

This repository is the backend API. It is currently in pre-launch — powering the waitlist, blog, and email infrastructure while the core compliance product is built.

---

## Architecture

BureauOS is a modular NestJS API backed by PostgreSQL via Prisma. Every domain — waitlists, IAM, blog, document hub, email management — is a self-contained module with its own controllers, services, and Prisma schema file. A shared `CoreModule` provides cross-cutting infrastructure: database access, API key gating, audit logging, and file upload.

### Module Map

```
src/
├── core/                    # Global infrastructure (exported to all modules)
│   ├── database/            # PrismaService + BaseDatabaseService
│   ├── api-gateway/         # API key model, guard, and management endpoints
│   ├── audit-logs/          # AuditLogsService — fire-and-forget event log
│   ├── upload/              # S3-backed file upload service
│   ├── utils/               # buildFillable, buildSearchQuery, buildRelations
│   └── config/              # Typed config factories (app, mail, swagger, upload)
├── iam/                     # Authentication (JWT + Passport), OTP, password reset
├── accounts/                # Multi-tenant account model
├── users/                   # User profiles and hashing
├── waitlists/               # Pre-launch waitlist, segmentation, drip campaigns
├── blog/                    # Blog post publishing
├── document-hub/            # Document storage and proceedings
└── email-managements/       # DB-driven Handlebars email engine + CRUD
```

---

## Design Decisions

### 1. Database Service Layer (`BaseDatabaseService`)

Every domain module that touches the database does so through a typed service class that extends `BaseDatabaseService`, rather than injecting Prisma directly into business logic services.

```typescript
// src/core/database/base.db.service.ts
export abstract class BaseDatabaseService {
  public fillable: string[] = [];   // controls what fields can be written
  public searchable: string[] = []; // controls what fields are queryable
  public relations: string[] = [];  // default eager-loaded relations

  async create(data: any) {
    return this.model.create({ data: buildFillable(data, this.fillable) });
  }

  async findAll(filterOptions, paginationOptions, relations) { ... }
  async findById(id, relations) { ... }
  async findFirst(where, relations) { ... }
  async update(id, data) { ... }
  async delete(id)       { ... } // soft delete (sets deletedAt)
  async forceDelete(id)  { ... } // hard delete
}
```

**Why this exists.** The direct alternative — injecting `PrismaService` into every service — works fine at small scale, but creates two recurring problems:

1. **Mass assignment.** A controller passes a raw DTO body to `prisma.model.create({ data: dto })`. A new field added to the model is now automatically writable from the API, whether that was intended or not. The `fillable` array makes write permissions explicit and declarative.
2. **Query sprawl.** Search, pagination, sort, and soft-delete filters get copy-pasted across services. `buildSearchQuery` and `buildRelations` centralise that logic once.

**The trade-off.** The abstract base uses `any` for the model type, which sacrifices some type safety at the data layer boundary. Prisma's generated types are strongly typed but are not easily composable into a single generic abstract class without complex TypeScript gymnastics. The current approach prioritises maintainability and velocity over compile-time completeness at the base layer — each concrete `DbService` still provides the right types at the service level where it matters.

A concrete example:

```typescript
@Injectable()
export class WaitlistsDbService extends BaseDatabaseService {
  public searchable = ['fullName', 'email', 'country', 'accountType', 'founderStage', 'professionalCategory', 'biggestChallenge', 'challengeArea'];
  public fillable   = ['fullName', 'email', 'country', 'accountType', 'founderStage', 'professionalCategory', 'companyName', 'rolePosition', 'expansionTarget', 'segments', 'step', 'lastSent', 'biggestChallenge', 'challengeArea', 'bosHelp'];
  constructor(prisma: PrismaService) {
    super(prisma.waitlist);
  }
}
```

All DB services configured:

| Service | Domain |
|---|---|
| `WaitlistsDbService` | Waitlist subscriptions, segmentation metadata |
| `BlogDbService` | Blog post publishing and metadata |
| `ApiGatewayDbService` | API gateway keys and rate limit config |
| `DocumentHubDbService` | Proceedings, comments, file uploads |
| `AuditLogsDbService` | Chronological event log |
| `EmailManagementDbService` | Handlebars email template records |
| `UserDatabaseService` | IAM user credentials |
| `AccountDatabaseService` | Multi-tenant account profiles |

---

### 2. Waitlist Workflow: Submission → Segmentation → Drip Campaign

The waitlist is not a simple email collector. Each submission is evaluated against a rule engine, tagged with behavioural segments, and enrolled in a cron-driven drip campaign. Three services coordinate this:

#### Submission (`WaitlistsService`)

On `POST /api/v1/waitlists`, the service:
1. Rejects duplicate emails with a `409 ConflictException`.
2. Evaluates segments by calling `WaitlistsSegmentationService.evaluateSegments(dto)`.
3. Persists the record with its segment tags and a `step = 1` counter.
4. Fires a `waitlist-welcome` email asynchronously (non-blocking `.catch()`).
5. Writes a fire-and-forget audit log entry.

#### Segmentation Engine (`WaitlistsSegmentationService`)

Pure, stateless, synchronous. Receives the DTO, runs rule checks, returns a string array of segment tags. No database access, no side effects — which is why it is independently testable without any mocking.

| Segment | Rule |
|---|---|
| `ng_uk_founder` | Country = Nigeria **AND** AccountType = Founder **AND** expansionTarget includes UK |
| `qatar_interested` | expansionTarget includes Qatar |
| `ecosystem_partner` | AccountType = Professional |
| `local_focus` | No expansion targets specified |

A single submission can match multiple segments and will receive all applicable email sequences.

#### Drip Campaign Orchestrator (`WaitlistsOrchestrationService`)

A `@Cron(CronExpression.EVERY_HOUR)` background job advances subscribers through their sequences:

```typescript
export const SEGMENT_SEQUENCES: Record<string, SequenceStep[]> = {
  ng_uk_founder: [
    { step: 1, templateSlug: 'ng-uk-founder-welcome',  delayDays: 0 },
    { step: 2, templateSlug: 'ng-uk-founder-nurture-1', delayDays: 7 },
    { step: 3, templateSlug: 'ng-uk-founder-cta',       delayDays: 7 },
  ],
  qatar_interested: [
    { step: 1, templateSlug: 'welcome-qatar-partnership', delayDays: 0 },
    { step: 2, templateSlug: 'qatar-application-open',    delayDays: 7 },
    { step: 3, templateSlug: 'qatar-deadline-reminder',   delayDays: 7 },
  ],
  ecosystem_partner: [{ step: 1, templateSlug: 'ecosystem-partner-welcome', delayDays: 0 }],
  local_focus:       [{ step: 1, templateSlug: 'local-focus-welcome',       delayDays: 0 }],
};
```

**How the cron works:**

1. Queries all subscribers where `subscribed_for_waitlist = true`.
2. For each subscriber, finds the `SequenceStep` matching their current `step` number across all their segments.
3. Checks whether `Date.now() - lastSent >= maxDelayDays` (uses `createdAt` if never sent).
4. If ready: sends all matching template emails, increments `step`, updates `lastSent`.
5. Errors are caught per-template and logged — one failed email does not skip the `step` increment.

**Why a cron job instead of a queue?** For pre-launch scale (hundreds to low thousands of subscribers) a scheduled hourly scan is operationally simpler than standing up a queue worker infrastructure. The trade-off is that this approach does not scale horizontally — running multiple API instances would trigger the cron on each. The `@nestjs/schedule` module should be gated to a single instance (or replaced with a proper job queue like BullMQ) before horizontal scaling.

---

### 3. Email Engine

Email content is not hardcoded. Templates are stored in the database with a `slug`, `subject`, and Handlebars `body`. The `EmailManagementsService` does three things on every `sendMail(to, slug, data)` call:

1. Fetches the template by slug from the database. Throws `404` if not found — this is intentional. A missing template is a deployment error, not a silent failure.
2. Compiles the database `body` field as a Handlebars template against `data`.
3. Wraps the compiled body in a global `layout.hbs` shell (brand header, footer), then sends via Nodemailer.

This means content and copy can be updated by seeding the database without a code deployment. Templates are seeded via `npm run deploy` which runs `prisma db seed`.

---

### 4. API Gateway (Public API Key Layer)

Routes intended for external clients (e.g. the frontend waitlist form) are protected by `ApiGatewayGuard` rather than JWT. The guard reads `x-api-key` from the request header, validates it against the `ApiGateway` table, and attaches the gateway record to `request.gateway`.

The gateway key is never returned in plaintext after creation — `ApiGatewayService.sanitizeGateway()` masks all but the last 4 characters on every response. The plaintext key is only shown once: during `npm run bootstrap`.

```
POST /api/v1/waitlists  →  ApiGatewayGuard  →  WaitlistsController
```

JWT authentication (`BearerTokenGuard`) gates internal dashboard routes.

---

### 5. IAM and Authentication

Authentication is handled by `AuthenticationService` using `@nestjs/passport` with two strategies:

- **`LocalStrategy`** — validates email/password on login
- **`JwtStrategy`** — validates Bearer token on authenticated routes

Token lifecycle:
- **Access token**: short-lived JWT (configurable TTL)
- **Refresh token**: long-lived JWT, hashed with bcrypt and stored as `hashedRt` on the user record. Rotation on use. Revoked on logout by nulling `hashedRt`.

OTP and password reset flows use `VerificationCode` records in the database with an `expiresAt` timestamp and a `completed` flag. Completing a verification invalidates all previous pending codes of the same type for that account (`updateMany` before creating a new record).

---

### 6. URI Versioning

All controllers are explicitly versioned at the controller level, with a global default of `v1`:

```typescript
// main.ts
app.setGlobalPrefix('api', { exclude: ['/'] });
app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

// controller
@Controller({ path: 'waitlists', version: '1' })
export class WaitlistsController {}
```

All live endpoints resolve to `/api/v1/...`. A `v2` controller can be introduced alongside `v1` without touching existing routes — zero-downtime deprecation.

---

### 7. Schema Merging (Prismix)

Each module owns its own `.prisma` schema file (e.g. `src/waitlists/models/waitlists.prisma`). A custom merge script (`scripts/prisma-merger.js`) concatenates these into a single `prisma/schema.prisma` before any Prisma command runs. This keeps model definitions co-located with their domain module rather than in a single monolithic schema file.

```bash
npm run prisma:merge     # merge schemas → prisma/schema.prisma
npm run prisma:generate  # merge + generate client
npm run prisma:migrate   # merge + migrate dev
npm run deploy           # full: generate + migrate + seed
```

---

## Security

| Layer | Mechanism |
|---|---|
| HTTP headers | `helmet` (XSS, clickjacking, CSP) |
| CORS | Allowlist via `ALLOWED_ORIGINS` env var |
| Rate limiting | `@nestjs/throttler` — 100 req/60s global |
| Swagger access | Basic Auth (username + password via `.env`) |
| Password storage | bcrypt |
| Refresh tokens | Hashed with bcrypt, stored server-side |
| API key exposure | Masked on all responses after creation |

---

## Project Setup

### Prerequisites
- **Node.js**: v22.x (LTS)
- **PostgreSQL**: v14+
- SMTP credentials for the email engine

### Installation

```bash
nvm use 22
npm install
```

### Environment

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/bureauos_db"

JWT_SECRET="your-access-token-secret"
JWT_REFRESH_SECRET="your-refresh-token-secret"

SWAGGER_USER="admin"
SWAGGER_PASSWORD="your-swagger-password"

MAIL_HOST="smtp.example.com"
MAIL_PORT=587
MAIL_USER="user@example.com"
MAIL_PASS="your-smtp-password"
MAIL_FROM="noreply@bureauos.space"
```

### Deploy

Merges schemas, generates the Prisma client, runs migrations, and seeds email templates:

```bash
npm run deploy
```

### Bootstrap (First Run)

Generates a cryptographically random API Gateway Key and sets up the initial admin account. Run once on a fresh environment:

```bash
npm run bootstrap
```

The script interactively prompts for admin name, email, and password (masked). At the end it prints the API Gateway Key — copy it to your frontend client's `.env` as `VITE_API_GATEWAY_KEY`. This is the only time the plaintext key is shown.

---

## Running the App

```bash
# Development (port 4000, watch mode)
npm run start:dev

# Production
npm run start:prod
```

---

## Testing

```bash
npm run test          # all unit tests
npm run test:cov      # with coverage report
npm run test:e2e      # end-to-end
```

| Test File | What it covers |
|---|---|
| `waitlists.service.spec.ts` | Duplicate email rejection, subscription creation, welcome email dispatch |
| `waitlists.segmentation.service.spec.ts` | Segment rule evaluation for all four segment types |
| `waitlists.orchestration.service.spec.ts` | Step advancement, delay gating, multi-segment email dispatch |
| `authentication.service.spec.ts` | Login, token generation, refresh rotation |
| `email-managements.service.spec.ts` | Template lookup, Handlebars compilation, Nodemailer dispatch |

---

## Swagger

```
http://localhost:4000/docs
```

Protected by Basic Auth (see `SWAGGER_USER` / `SWAGGER_PASSWORD` in `.env`). API key routes accept `x-api-key` header; authenticated routes accept `Authorization: Bearer <token>`.

---

## Technical Debt

- **Sentry**: `HttpExceptionFilter` has Sentry integration stubbed out. Requires `npm install @sentry/node` and `SENTRY_URL` in `.env`.
- **Cron scaling**: The hourly drip campaign cron is not safe across multiple API instances. Needs a distributed lock or migration to BullMQ before horizontal scaling.
- **Admin role-gating**: Waitlist admin endpoints are currently protected only by API key. A `RoleGuard` distinguishing `BUSINESS` vs `ADMIN` key types is needed before multi-tenant access is opened.
- **Drip template seeding**: Segment-specific templates (`ng-uk-founder-nurture-1`, `qatar-application-open`, etc.) must exist in the database before the orchestrator runs. They are seeded by `npm run deploy`.

---

## License

UNLICENSED — proprietary.
