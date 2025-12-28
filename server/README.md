# SecureAuth Gateway - Backend Server

## 🚀 Payment-Grade Authentication Infrastructure

A production-ready authentication system built with TypeScript, Express.js, and MongoDB. This backend serves as a centralized identity provider supporting JWT-based authentication, OAuth 2.0, and Role-Based Access Control (RBAC).

## 📦 Tech Stack

- **Runtime:** Node.js 18+
- **Language:** TypeScript (Strict Mode)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Security:** Helmet, CORS, Rate Limiting, JWT
- **Logging:** Winston + Morgan

## 🏗️ Project Structure

```
server/
├── src/
│   ├── config/          # Configuration management
│   │   ├── index.ts     # Centralized config
│   │   └── database.ts  # Database connection
│   ├── controllers/     # Route controllers (business logic)
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Custom middleware (auth, RBAC, etc.)
│   ├── services/        # Business logic layer
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript type definitions
│   └── app.ts           # Main application entry point
├── logs/                # Application logs
├── dist/                # Compiled JavaScript (production)
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
├── package.json
└── tsconfig.json
```

## 🔧 Installation

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Setup Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

## 🔐 Security Features

- **Helmet:** Sets secure HTTP headers
- **CORS:** Configured for specific origin whitelist
- **Rate Limiting:** Prevents DDoS attacks
- **Input Sanitization:** Protection against NoSQL injection
- **HPP:** HTTP Parameter Pollution prevention
- **Compression:** Gzip compression for responses

## 🎯 API Endpoints (Planned)

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/google` - Google OAuth initiation
- `GET /api/v1/auth/google/callback` - Google OAuth callback

### User Management
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `GET /api/v1/users/sessions` - Active sessions

### Transactions (Mock)
- `POST /api/v1/transaction/simulate` - Simulate payment (RBAC protected)

### Admin
- `GET /api/v1/admin/users` - List all users
- `PATCH /api/v1/admin/users/:id/ban` - Ban user
- `PATCH /api/v1/admin/users/:id/unban` - Unban user

## 📝 Scripts

```bash
npm run dev          # Start development server with hot-reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Run production server
npm run lint         # Check code quality
npm run lint:fix     # Auto-fix linting issues
npm test             # Run test suite
```

## 🌐 Environment Variables

See `.env.example` for all required environment variables.

## 👨‍💻 Development

The project uses TypeScript with strict mode enabled for maximum type safety. All imports use path aliases for cleaner imports:

```typescript
import config from '@/config';
import logger from '@/utils/logger';
import { UserRole } from '@/types';
```

## 📊 Logging

Winston logger with three levels:
- **error.log:** Error-level logs only
- **combined.log:** All logs
- **Console:** Development output (colorized)

## 🚢 Next Steps

1. Implement User model with Mongoose
2. Create authentication controllers and routes
3. Implement JWT service (access + refresh tokens)
4. Setup Google OAuth 2.0 with Passport.js
5. Create RBAC middleware
6. Add rate limiting middleware
7. Implement mock transaction endpoint

---

Built with ❤️ for production-grade portfolio demonstration
