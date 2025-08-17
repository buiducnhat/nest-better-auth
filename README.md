# nest-better-auth

A NestJS integration library for [better-auth](https://www.better-auth.com/), providing seamless authentication support for both Express and Fastify platforms.

[![npm version](https://badge.fury.io/js/%40buiducnhat%2Fnest-better-auth.svg)](https://badge.fury.io/js/%40buiducnhat%2Fnest-better-auth)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Easy Integration**: Simple setup with NestJS modules
- 🔒 **Authentication Guard**: Built-in guard for protecting routes
- 🎯 **Decorators**: Convenient decorators for accessing user session and data, and isPublic for marking routes as publicly accessible
- 🌐 **Multi-Platform**: Supports both Express and Fastify
- ⚙️ **Flexible Configuration**: Both synchronous and asynchronous configuration options
- 📝 **Type-Safe**: Full TypeScript support with proper typing

## Installation

Before you start, make sure you have a Better Auth instance configured. If you haven't done that yet, check out the [installation](https://www.better-auth.com/docs/installation).

> Note: This is not the official library of Better Auth. It is a community-driven library that is not officially supported by Better Auth.

```bash
npm install @buiducnhat/nest-better-auth
# or
yarn add @buiducnhat/nest-better-auth
# or
pnpm add @buiducnhat/nest-better-auth
```

## Quick Start

### 1. Basic Setup with Express

```typescript
import { AuthGuard, AuthModule } from "@buiducnhat/nest-better-auth";
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { betterAuth } from "better-auth";

@Module({
  imports: [
    AuthModule.forRoot({
      betterAuth: betterAuth({
        basePath: "/auth",
        secret: process.env.AUTH_SECRET,
        emailAndPassword: {
          enabled: true,
        },
        database: {
          // Your database configuration
        },
      }),
      options: {
        routingProvider: "express", // default
        jsonParser: true, // default
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
```

Due to [this document](https://www.better-auth.com/docs/integrations/express#mount-the-handler):

> Don’t use express.json() before the Better Auth handler. Use it only for other routes, or the client API will get stuck on "pending".

So, you need to turn off the `bodyParser` option on `main.ts` file.

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, bodyParser: false });
  await app.listen(9001);
}
```

### 2. Basic Setup with Fastify

```typescript
import { AuthGuard, AuthModule } from "@buiducnhat/nest-better-auth";
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { betterAuth } from "better-auth";

@Module({
  imports: [
    AuthModule.forRoot({
      betterAuth: betterAuth({
        basePath: "/auth",
        secret: process.env.AUTH_SECRET,
        emailAndPassword: {
          enabled: true,
        },
        database: {
          // Your database configuration
        },
      }),
      options: {
        routingProvider: "fastify",
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
```

### 3. Using Controllers with Authentication

```typescript
import { CurrentUser, IsPublic, Session, User, UserSession } from "@buiducnhat/nest-better-auth";
import { Body, Controller, Get, Post } from "@nestjs/common";

@Controller()
export class AppController {
  // Public route - no authentication required
  @IsPublic()
  @Get("public")
  getPublicData() {
    return { message: "This is a public endpoint" };
  }

  // Protected route - authentication required
  @Get("protected")
  getProtectedData() {
    return { message: "This is a protected endpoint" };
  }

  // Get current user information
  @Get("me")
  getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  // Get full session information
  @Get("session")
  getSession(@Session() session: UserSession) {
    return session;
  }

  // Protected POST route
  @Post("user-action")
  performUserAction(@CurrentUser() user: User, @Body() data: any) {
    return {
      user: user.id,
      action: "performed",
      data,
    };
  }
}
```

## Advanced Configuration

### Async Configuration

For more complex setups, you can use async configuration with dependency injection:

```typescript
import { AuthGuard, AuthModule } from "@buiducnhat/nest-better-auth";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { betterAuth } from "better-auth";

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        betterAuth: betterAuth({
          basePath: configService.get("AUTH_BASE_PATH", "/auth"),
          secret: configService.get("AUTH_SECRET"),
          emailAndPassword: {
            enabled: true,
          },
          database: {
            provider: configService.get("DB_PROVIDER"),
            url: configService.get("DATABASE_URL"),
          },
        }),
        options: {
          routingProvider: configService.get("ROUTING_PROVIDER", "express"),
        },
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
```

### Configuration File Example

```typescript
// config/configuration.ts
export default () => ({
  betterAuth: {
    basePath: process.env.AUTH_BASE_PATH || "/auth",
    secret: process.env.AUTH_SECRET,
    database: {
      provider: process.env.DB_PROVIDER || "sqlite",
      url: process.env.DATABASE_URL || "./database.db",
    },
  },
});
```

## API Reference

### AuthModule

#### Static Methods

- `forRoot(options)`: Configure the module synchronously
- `forRootAsync(options)`: Configure the module asynchronously

#### Options

```typescript
interface AuthModuleOptions {
  betterAuth: ReturnType<typeof betterAuth>;
  options?: {
    routingProvider?: "express" | "fastify"; // default: 'express'
    jsonParser?: boolean; // default: true
  };
}
```

### AuthGuard

A guard that protects routes by checking for valid authentication sessions.

```typescript
import { AuthGuard } from '@buiducnhat/nest-better-auth';
import { APP_GUARD } from '@nestjs/core';

// Apply globally
{
  provide: APP_GUARD,
  useClass: AuthGuard,
}

// Apply to specific controllers
@UseGuards(AuthGuard)
@Controller('protected')
export class ProtectedController {}
```

### Decorators

#### @IsPublic()

Mark routes as publicly accessible, bypassing the AuthGuard:

```typescript
@IsPublic()
@Get('public')
getPublicData() {
  return { message: 'No authentication required' };
}
```

#### @CurrentUser()

Inject the current authenticated user:

```typescript
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

#### @Session()

Inject the full session object:

```typescript
@Get('session-info')
getSessionInfo(@Session() session: UserSession) {
  return {
    user: session.user,
    sessionId: session.id,
    expiresAt: session.expiresAt,
  };
}
```

## Error Handling

The library automatically handles authentication errors and returns appropriate HTTP status codes:

- `401 Unauthorized`: When authentication is required but not provided
- The library integrates with better-auth's error handling system

```typescript
import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { APIError } from "better-auth/api";

@Catch(APIError)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: APIError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(exception.status).json({
      statusCode: exception.status,
      message: exception.message,
      error: exception.body?.code,
    });
  }
}
```

## Examples

The repository includes complete examples for different setups:

- [Express Example](./example/with-express/) - Basic Express setup
- [Fastify Example](./example/with-fastify/) - Basic Fastify setup
- [Async Configuration Example](./example/with-for-root-async/) - Advanced async configuration

## Integration with Better Auth

This library is designed to work seamlessly with better-auth features:

### Plugins

```typescript
import { bearer, twoFactor } from "better-auth/plugins";

AuthModule.forRoot({
  betterAuth: betterAuth({
    plugins: [
      bearer(), // Bearer token authentication
      twoFactor(), // Two-factor authentication
      // ... other plugins
    ],
  }),
});
```

### Custom Authentication Logic

You can extend the AuthGuard for custom authentication logic:

```typescript
import { AuthGuard } from "@buiducnhat/nest-better-auth";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CustomAuthGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) return false;

    // Add custom logic here
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Example: Check user role
    if (user.role !== "admin") {
      throw new ForbiddenException("Admin access required");
    }

    return true;
  }
}
```

## Requirements

- Node.js 18+
- NestJS 10+
- Better Auth 1.3.6+

## Peer Dependencies

- `@nestjs/common` ^11.1.6
- `@nestjs/core` ^11.1.6
- `better-auth` ^1.3.6

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you found this library helpful, please consider giving it a ⭐ on [GitHub](https://github.com/buiducnhat/nest-better-auth)!

For issues and feature requests, please use the [GitHub Issues](https://github.com/buiducnhat/nest-better-auth/issues).
