# User & Auth API

A comprehensive TypeScript-based REST API for user management and authentication built with NestJS, TypeORM, MySQL, and JWT.

## Features

- **User Management CRUD Operations**
  - Create users with email validation
  - List all active users (with JWT authentication)
  - Get individual user details
  - Update user information
  - Soft delete (marks as deleted without removing data)
  - Hard delete (permanently removes from database)

- **Authentication System**
  - User login with email/password
  - JWT token generation using Jose library
  - Get current authenticated user
  - Bearer token authentication

- **Security & Best Practices**
  - Password hashing with bcrypt
  - JWT-based authentication with Passport
  - Input validation with class-validator
  - Type-safe DTOs and entities
  - Comprehensive error handling

- **API Documentation**
  - Swagger/OpenAPI documentation
  - Interactive API testing interface
  - Detailed endpoint descriptions and examples

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: MySQL with TypeORM
- **Authentication**: JWT (Jose library) with Passport
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer
- **Password Security**: bcrypt

## Prerequisites

- Node.js 18+
- MySQL 5.7+
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env file with your database credentials
   ```

4. **Create MySQL database**
   ```sql
   CREATE DATABASE user_api_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Start the application**
   ```bash
   # Development mode (with watch)
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

6. **Access the API**
   - API Base URL: `http://localhost:3001/api`
   - Swagger Documentation: `http://localhost:3001/api/docs`

## Project Structure

```
src/
├── config/
│   └── database.config.ts          # TypeORM configuration
├── users/
│   ├── entities/
│   │   └── user.entity.ts          # User ORM entity
│   ├── dto/
│   │   ├── create-user.dto.ts      # Create user request
│   │   ├── update-user.dto.ts      # Update user request
│   │   └── user-response.dto.ts    # User response DTO
│   ├── users.service.ts            # User business logic
│   ├── users.controller.ts         # User API endpoints
│   └── users.module.ts             # User module
├── auth/
│   ├── dto/
│   │   ├── login.dto.ts            # Login request
│   │   └── login-response.dto.ts   # Login response
│   ├── interfaces/
│   │   └── jwt-payload.interface.ts # JWT payload structure
│   ├── strategies/
│   │   └── jwt.strategy.ts         # Passport JWT strategy
│   ├── guards/
│   │   └── jwt.guard.ts            # JWT authentication guard
│   ├── auth.service.ts             # Auth business logic
│   ├── auth.controller.ts          # Auth API endpoints
│   └── auth.module.ts              # Auth module
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts
```

## API Endpoints

### Authentication

#### 1. Login
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticate user and get JWT token
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "created_at": "2024-01-01T00:00:00.000Z",
      "modified_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### 2. Get Current User
- **Endpoint**: `GET /api/auth/me`
- **Description**: Get current authenticated user details
- **Authentication**: Bearer token (required)
- **Response** (200 OK): User object (same structure as login response)

### User Management

#### 1. Create User
- **Endpoint**: `POST /api/users`
- **Description**: Create a new user account
- **Request Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (201 Created): User object

#### 2. List All Users
- **Endpoint**: `GET /api/users`
- **Description**: Get all active users (non-deleted)
- **Authentication**: Bearer token (required)
- **Response** (200 OK): Array of user objects

#### 3. Get User by ID
- **Endpoint**: `GET /api/users/:id`
- **Description**: Get specific user details
- **Authentication**: Bearer token (required)
- **Response** (200 OK): User object

#### 4. Update User (PATCH)
- **Endpoint**: `PATCH /api/users/:id`
- **Description**: Update user information
- **Authentication**: Bearer token (required)
- **Request Body** (all fields optional):
  ```json
  {
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "password": "newpassword123"
  }
  ```
- **Response** (200 OK): Updated user object

#### 5. Update User (POST)
- **Endpoint**: `POST /api/users/:id`
- **Description**: Update user information (alternative POST method)
- **Authentication**: Bearer token (required)
- **Request Body**: Same as PATCH
- **Response** (200 OK): Updated user object

#### 6. Delete User (Soft Delete)
- **Endpoint**: `DELETE /api/users/:id`
- **Description**: Soft delete user (marks as deleted, data remains)
- **Authentication**: Bearer token (required)
- **Response** (204 No Content)

#### 7. Soft Delete (Alternative)
- **Endpoint**: `DELETE /api/users/:id/soft`
- **Description**: Explicitly soft delete user
- **Authentication**: Bearer token (required)
- **Response** (204 No Content)

#### 8. Hard Delete
- **Endpoint**: `DELETE /api/users/:id/hard`
- **Description**: Permanently delete user from database
- **Authentication**: Bearer token (required)
- **Response** (204 No Content)

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_deleted_at (deleted_at)
);
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Example Using cURL:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get current user
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <token>"

# List users
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer <token>"
```

## Available Scripts

```bash
# Development
npm run start:dev          # Start with watch mode
npm run start:debug        # Start with debugging

# Production
npm run build              # Build the application
npm run start:prod         # Run production build

# Linting & Formatting
npm run lint               # Run ESLint
npm run format             # Format code with Prettier

# Testing
npm test                   # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests
```

## Error Handling

The API uses standard HTTP status codes and provides detailed error messages:

- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Missing or invalid authentication token
- **404 Not Found**: Resource not found
- **409 Conflict**: Email already exists
- **500 Internal Server Error**: Server error

## Security Considerations

1. **Change JWT Secret**: Update `JWT_SECRET` in `.env` for production
2. **Use HTTPS**: Always use HTTPS in production
3. **Database Security**: Use strong passwords and limit database user privileges
4. **Password Policy**: Consider implementing password strength requirements
5. **Rate Limiting**: Consider adding rate limiting for production
6. **CORS**: Configure CORS if frontend is on different domain

## Development

### Adding New Endpoints

1. Create a new method in the service
2. Add corresponding controller method with decorators
3. Update Swagger decorators for documentation
4. Test using Swagger UI at `/api/docs`

### Database Migrations

With `synchronize: true` in development, schema changes are automatic. For production:

```bash
# TypeORM migrations would be configured separately
```

## Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### JWT Token Invalid
- Verify token hasn't expired (default 1 hour)
- Check `JWT_SECRET` matches on server
- Ensure token is correctly formatted in Authorization header

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using the port

## Contributing

1. Follow the project structure
2. Use TypeScript with strict mode
3. Add proper error handling
4. Document new endpoints with Swagger decorators
5. Add validation on all inputs

## License

UNLICENSED
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
