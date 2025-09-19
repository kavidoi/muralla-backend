# Muralla Backend API

NestJS-based backend API for Muralla Cafe management system.

## Features

- 🔐 **JWT Authentication** with multi-admin support
- 🧾 **Invoicing System** with OpenFactura integration
- 💚 **Health Check** endpoints for monitoring
- 📊 **Prisma ORM** with PostgreSQL
- 🔒 **Environment-based** credential management

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Payment**: MercadoPago SDK
- **Invoicing**: OpenFactura API
- **Runtime**: Node.js 20.19.0

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/muralla_db"

# Authentication
JWT_SECRET="your-secret-key"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="secure-password"
ADMIN_USER="Admin Name"
SECONDARY_ADMIN_EMAIL="admin2@example.com"
SECONDARY_ADMIN_PASSWORD="secure-password"
SECONDARY_ADMIN_USER="Admin 2 Name"
TERTIARY_ADMIN_EMAIL="admin3@example.com"
TERTIARY_ADMIN_PASSWORD="secure-password"
TERTIARY_ADMIN_USER="Admin 3 Name"

# OpenFactura
OPENFACTURA_BASE_URL="https://api.haulmer.com"
OPENFACTURA_API_KEY="your-api-key"
COMPANY_RUT="78188363-8"

# URLs
BACKEND_URL="https://api.murallacafe.cl"
FRONTEND_URL="https://admin.murallacafe.cl"

# MercadoPago (optional)
MP_PUBLIC_KEY="your-public-key"
MP_ACCESS_TOKEN="your-access-token"
```

## Development

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Get current user profile
- `POST /auth/logout` - Logout

### Invoicing
- `GET /invoicing/documents` - List all documents
- `GET /invoicing/documents/:id` - Get document by ID
- `POST /invoicing/documents/import` - Import from OpenFactura
- `GET /invoicing/received-documents` - List received invoices

### Health Check
- `GET /health` - Basic health status
- `GET /health/healthz` - Detailed health check endpoint

## Deployment on Render

### Build Command
```bash
npm ci --include=dev && npx prisma generate && npm run build
```

### Start Command
```bash
npm run start
```

### Pre-Deploy Command
```bash
npx prisma migrate deploy
```

## License

Private - Muralla Cafe © 2025
