# 🚀 BureauOS API

The core infrastructure layer for global business compliance, specialized in modular scaling and automated regulatory workflows.

## 🏗️ Architecture
BureauOS uses a high-performance **Modular NestJS** architecture with **Prisma** for database access. Each module is self-contained with its own models, services, and controllers.

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
Run the unified deploy command to merge schemas, generate the client, and seed the database templates.
```bash
npm run deploy
```

---

## 🚀 Running the App

```bash
# development
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
npm run test -- authentication.service.spec.ts
```

---

## 📄 Documentation
Once the server is running, visit the interactive Swagger documentation:
- **URL**: `http://localhost:3000/docs`
- **Gating**: Protected by **Basic Auth** (see `.env`)

---

## 📧 Email Engine
BureauOS features a premium **Handlebars (.hbs)** email system.
- **Location**: `src/email-managements/templates/layout.hbs`
- **Branding**: Official checkmark layout with BureauOS logo.

---

## 📜 License
BureauOS is [UNLICENSED](LICENSE).
