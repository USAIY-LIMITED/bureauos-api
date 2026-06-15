# 🚀 BureauOS API

The core infrastructure layer for global business compliance, specialized in modular scaling and automated regulatory workflows.

## 🏗️ Architecture
BureauOS uses a high-performance **Modular NestJS** architecture with **Prisma** for database access. Each module is self-contained with its own models, services, and controllers.

### 🗄️ Database Service Layer
To isolate database interactions, limit direct model coupling, and enforce write-safety (fillable) / query-safety (searchable) configurations, all database operations route through a dedicated **DB Service Layer** extending `BaseDatabaseService`.

The service classes configured:
- `WaitlistsDbService`: Wraps waitlist subscriptions and questionnaires.
- `BlogDbService`: Wraps blog post publishing and metadata.
- `ApiGatewayDbService`: Wraps private API gateways and rate limits.
- `DocumentHubDbService`: Wraps proceedings, comments, and file uploads.
- `AuditLogsDbService`: Wraps chronological user logs.
- `EmailManagementDbService`: Wraps Handlebars email template records.
- `UserDatabaseService` & `AccountDatabaseService`: Wrap IAM credentials and multi-tenant profiles.

#### Configuration Example:
```typescript
@Injectable()
export class WaitlistsDbService extends BaseDatabaseService {
  public searchable = ['fullName', 'email', 'country'];
  public fillable = ['fullName', 'email', 'country', 'wantsNewsletter'];
  constructor(prisma: PrismaService) {
    super(prisma.waitlist);
  }
}
```

### 🛣️ API Versioning
BureauOS uses built-in **NestJS URI Versioning** to support modular, zero-downtime controller deprecation and concurrent version lifecycles (e.g. `/api/v1` and `/api/v2` running side-by-side).

#### Setup details:
- Enabled globally in [main.ts](file:///Users/mac/Documents/U-apps/BureauOS/bureau-osapi/src/main.ts):
  ```typescript
  app.setGlobalPrefix('api', { exclude: ['/'] });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  ```
- **Specifying Controller Version**: Always configure versioning explicitly at the controller level:
  ```typescript
  @Controller({ path: 'waitlists', version: '1' })
  export class WaitlistsController {}
  ```
- Adding a new version is as simple as adding a new controller decorated with `version: '2'`.

---

## 🛠️ Project Setup

### 1. Prerequisites
- **Node.js**: v22.x (LTS) — *Crucial for modern decorator Support*
- **PostgreSQL**: v14+
- **Nodemailer**: SMTP credentials for Handlebars (.hbs) email engine.

### 2. Installation
```bash
# Ensure you are on Node 22
nvm use 22

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and populate it:
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/bureauos_db"

# JWT
JWT_SECRET="your-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Swagger
SWAGGER_USER="admin"
SWAGGER_PASSWORD="bureau_admin_pass"

# Email (SMTP)
MAIL_HOST="smtp.example.com"
MAIL_PORT=587
MAIL_USER="user@example.com"
MAIL_PASS="pass"
MAIL_FROM="noreply@bureauos.space"
```

### 4. Ecosystem Deployment
Run the unified deploy command to merge schemas, generate the client, and seed non-sensitive database templates (like emails):
```bash
npm run deploy
```

### 5. Secure Bootstrapping (First-Time Admin Setup)
To securely initialize the production admin account and generate the API Gateway Key, run:
```bash
npm run bootstrap
```
This script will interactively and securely prompt you for:
- **Admin First & Last Name** (defaults to `"System Admin"`)
- **Admin Email** (required)
- **Admin Password** (required, typing will be masked securely in the terminal)

At the end of execution, the script will output a secure, cryptographically random API Gateway Key. Copy this key and use it as `VITE_API_GATEWAY_KEY` in your frontend client `.env` configuration.

---

## 🚀 Running the App

```bash
# development (runs on port 4000)
npm run start:dev

# production mode
npm run start:prod
```

---

## 🧪 Testing
The BureauOS test suite validates core domain logic using Jest.
```bash
# run all tests
npm run test

# run specific tests
npm run test -- waitlists.service.spec.ts
```

---

## 📄 Documentation
Once the server is running, visit the interactive Swagger documentation:
- **URL**: `http://localhost:4000/docs`
- **Gating**: Protected by **Basic Auth** (see `.env`)

---

## 📧 Email Engine
BureauOS features a premium **Handlebars (.hbs)** email system.
- **Location**: `src/email-managements/templates/layout.hbs`
- **Branding**: Official checkmark layout with BureauOS logo.

## 🏗️ Current Technical Debt
- **Sentry Error Tracking**: Currently bypassed in `HttpExceptionFilter`. Requires `npm install @sentry/node` and `SENTRY_URL` configuration for production launch.
- **Administrative Role-Gating**: Waitlist management is protected by `API-KEY`, but requires a future `RoleGuard` to distinguish between `BUSINESS` and `ADMIN` key owners.

## 📜 License
BureauOS is [UNLICENSED](LICENSE).
