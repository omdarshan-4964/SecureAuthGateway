# 🛡️ SecureAuth Gateway

> Enterprise-grade authentication and authorization system with JWT, RBAC, and transaction management

[![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)]()
[![Docker](https://img.shields.io/badge/docker-enabled-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 📖 Overview

**SecureAuth Gateway** is a full-stack authentication system demonstrating enterprise security patterns including JWT authentication, role-based access control (RBAC), real-time transaction processing, and admin user management. Built with Next.js, Express, MongoDB, and Docker.

### ✨ Key Features

- 🔐 **JWT Authentication** - Access tokens (15min) + refresh tokens (7d) with auto-renewal
- 👥 **3-Tier RBAC** - USER, MERCHANT, ADMIN roles with granular permissions
- 💳 **Transaction Management** - Payment processing with real-time status updates
- 👤 **User Management** - Admin dashboard to ban/unban users
- 🐳 **Docker Ready** - Full containerization with health checks
- 🎨 **Modern UI** - Neo-Fintech design with glass-morphism effects
- 🔒 **Security First** - bcrypt hashing, CORS, rate limiting, input validation

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- Node.js 20+ (for local development)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/omdarshan-4964/SecureAuthGateway.git
   cd SecureAuthGateway
   ```

2. **Set up environment variables:**
   ```bash
   # Create server environment file
   cp server/.env.example server/.env
   
   # Edit server/.env with your values:
   # - MONGODB_URI (your MongoDB connection string)
   # - JWT_SECRET (generate with: openssl rand -base64 32)
   # - JWT_REFRESH_SECRET (generate with: openssl rand -base64 32)
   ```

3. **Start with Docker:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/health

5. **Create your first admin account:**
   - Navigate to http://localhost:3000/auth/register
   - Fill in details and select **ADMIN** role
   - Login and explore!

---

## 🏗️ Project Structure

```
SecureAuth-Gateway/
├── client/                 # Next.js 15 Frontend
│   ├── app/               # App Router pages
│   │   ├── auth/          # Login, Register
│   │   └── dashboard/     # Main app, Transactions, Settings, Users
│   ├── components/        # Reusable UI components
│   ├── lib/               # Auth context, hooks, API client
│   └── Dockerfile
│
├── server/                 # Express Backend
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # JWT, RBAC, error handling
│   │   ├── models/        # MongoDB schemas (User, Transaction)
│   │   ├── routes/        # API endpoints
│   │   └── app.ts         # Express setup
│   └── Dockerfile
│
├── docker-compose.yml      # Multi-container orchestration
├── .gitignore             # Git ignore rules
├── README.md              # This file
└── PROJECT_FINAL_REPORT.md # Complete documentation
```

---

## 🎯 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **State:** React Context + TanStack Query

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB
- **Auth:** JWT (jsonwebtoken)
- **Security:** bcrypt, helmet, cors, rate-limit

### DevOps
- **Containers:** Docker + Docker Compose
- **Development:** Hot-reload enabled
- **Health Checks:** All services monitored

---

## 👥 User Roles & Permissions

| Role | Access Level | Permissions |
|------|--------------|-------------|
| **USER** | Basic | View dashboard, Update profile |
| **MERCHANT** | Intermediate | USER + Process payments, View own transactions |
| **ADMIN** | Full | MERCHANT + View all transactions, Manage users (ban/unban) |

---

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - Login and get tokens
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout and clear tokens

### Transactions (MERCHANT/ADMIN only)
- `POST /api/v1/transaction/simulate` - Process payment
- `GET /api/v1/transaction/history` - Get transaction history (RBAC filtered)

### User Management (ADMIN only)
- `GET /api/v1/users` - Get all users
- `PATCH /api/v1/users/:id/status` - Ban/unban user

---

## 🧪 Testing

### Manual Testing

1. **Create test accounts with different roles:**
   ```
   USER:     user@test.com / Test@1234
   MERCHANT: merchant@test.com / Test@1234
   ADMIN:    admin@test.com / Test@1234
   ```

2. **Test RBAC enforcement:**
   - Login as USER → Try accessing transactions → Should see 403
   - Login as MERCHANT → Process payment → View only own transactions
   - Login as ADMIN → View all transactions → Access user management

3. **Test user ban feature:**
   - Login as ADMIN → Navigate to /dashboard/users
   - Ban a USER account
   - Logout and try login as banned user → Should see "Account deactivated"
   - Unban user and verify they can login again

### API Testing (Postman/cURL)

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@test.com","password":"Test@1234","role":"MERCHANT"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"Test@1234"}'

# Get profile (replace TOKEN with accessToken from login response)
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose build client
docker-compose build server

# View logs
docker-compose logs -f server
docker-compose logs -f client

# Check container status
docker-compose ps

# Complete rebuild
docker-compose down && docker-compose build && docker-compose up -d
```

---

## 🔒 Security Features

- ✅ **Password Hashing:** bcrypt with 10 salt rounds
- ✅ **JWT Tokens:** Signed with HS256, short-lived access tokens
- ✅ **Token Rotation:** Auto-refresh mechanism
- ✅ **HttpOnly Cookies:** Refresh tokens protected from XSS
- ✅ **CORS:** Configured with origin whitelist
- ✅ **Rate Limiting:** 100 requests per 15min window
- ✅ **Input Validation:** Zod schemas on backend
- ✅ **RBAC Enforcement:** Multi-layer (JWT → Role check → Controller)
- ✅ **XSS Protection:** helmet middleware + React escaping
- ✅ **Error Handling:** Never expose internal errors

---

##  Troubleshooting

### Containers won't start
```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Check logs
docker-compose logs mongo
docker-compose logs server
docker-compose logs client
```

### MongoDB connection fails
```bash
# Verify MongoDB is running
docker ps | grep mongo

# Check connection string in server/.env
# Should be: mongodb://mongo:27017/secureauth
```

### JWT errors
```bash
# Ensure JWT_SECRET is set in server/.env
# Clear browser localStorage and try again
```

---

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack application architecture
- JWT authentication implementation
- Role-based access control (RBAC)
- MongoDB schema design
- Docker multi-container orchestration
- RESTful API design
- Modern React patterns (Context, hooks)
- TypeScript for type safety
- Security best practices

---

## 🚀 Future Enhancements

- [ ] Email verification service
- [ ] Password recovery flow
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Audit logging system
- [ ] Real payment gateway integration
- [ ] Advanced analytics dashboard
- [ ] Unit and E2E tests
- [ ] CI/CD pipeline

---

## 📊 Project Stats

- **Lines of Code:** ~8,500
- **Development Time:** ~40 hours
- **TypeScript Files:** 52
- **React Components:** 20
- **API Endpoints:** 9
- **Docker Containers:** 3

---

## 🤝 Contributing

This is a portfolio project, but suggestions and improvements are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Omdarshan Shinde Patil**
- GitHub: [@omdarshan-4964](https://github.com/omdarshan-4964)
- LinkedIn: [Omdarshan Shinde Patil](https://www.linkedin.com/in/omdarshanshindepatil/)
- Portfolio: [portfolio-omdarshanpatil.vercel.app](https://portfolio-omdarshanpatil.vercel.app/)
- Email: omdarshanpatil@gmail.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Docker](https://www.docker.com/) - Containerization

---

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐️!

---

**Last Updated:** December 29, 2025
