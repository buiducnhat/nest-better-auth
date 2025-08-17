import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
} from "./auth.module-definition";
import { AUTH_MODULE_OPTIONS_TOKEN, BETTER_AUTH_INSTANCE_TOKEN } from "./tokens";
import type { AuthModuleOptions } from "./types";
import {
  DynamicModule,
  Global,
  Inject,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { type Auth } from "better-auth";
import { toNodeHandler } from "better-auth/node";
import express from "express";
import { FastifyReply, FastifyRequest } from "fastify";

@Global()
@Module({})
export class AuthModule extends ConfigurableModuleClass implements NestModule {
  private readonly logger = new Logger(AuthModule.name);

  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    return {
      module: AuthModule,
      providers: [
        {
          provide: BETTER_AUTH_INSTANCE_TOKEN,
          useValue: options.betterAuth,
        },
        {
          provide: AUTH_MODULE_OPTIONS_TOKEN,
          useValue: options.options,
        },
      ],
      exports: [BETTER_AUTH_INSTANCE_TOKEN, AUTH_MODULE_OPTIONS_TOKEN],
    };
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      module: AuthModule,
      imports: options.imports || [],
      providers: [
        // Register the MODULE_OPTIONS_TOKEN provider using the same pattern as ConfigurableModuleBuilder
        {
          provide: MODULE_OPTIONS_TOKEN,
          useFactory: options.useFactory!,
          inject: options.inject || [],
        },
        {
          inject: [MODULE_OPTIONS_TOKEN],
          provide: BETTER_AUTH_INSTANCE_TOKEN,
          useFactory: (moduleOptions: AuthModuleOptions) => moduleOptions.betterAuth,
        },
        {
          inject: [MODULE_OPTIONS_TOKEN],
          provide: AUTH_MODULE_OPTIONS_TOKEN,
          useFactory: (moduleOptions: AuthModuleOptions) => moduleOptions.options,
        },
      ],
      exports: [BETTER_AUTH_INSTANCE_TOKEN, AUTH_MODULE_OPTIONS_TOKEN],
    };
  }

  constructor(
    @Inject(BETTER_AUTH_INSTANCE_TOKEN) private readonly auth: Auth,
    @Inject(AUTH_MODULE_OPTIONS_TOKEN) private readonly options: AuthModuleOptions["options"],
  ) {
    super();
  }

  configure(consumer: MiddlewareConsumer) {
    const basePath = this.auth.options.basePath || "/auth";

    if (this.options?.routingProvider === "express") {
      // Reapply body parser for routes that are not handled by better-auth
      consumer
        .apply((req, res, next) => {
          if (req.url.startsWith(basePath)) {
            next();
          } else {
            // Reapply json parser if enabled
            if (this.options?.jsonParser) {
              express.json()(req, res, (err) => {
                if (err) {
                  next(err);
                  return;
                }
                express.urlencoded({ extended: true })(req, res, next);
              });
            } else {
              next();
            }
          }
        })
        .forRoutes({
          path: "/*path",
          method: RequestMethod.ALL,
        });

      // Apply better-auth to auth routes
      consumer.apply(toNodeHandler(this.auth)).forRoutes({
        path: `${basePath}/*path`,
        method: RequestMethod.ALL,
      });
    } else if (this.options?.routingProvider === "fastify") {
      consumer
        .apply((request: FastifyRequest["raw"], reply: FastifyReply["raw"], next: () => void) => {
          // Convert Fastify headers to standard Headers object
          const headers = new Headers();
          Object.entries(request.headers).forEach(([key, value]) => {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            if (value) headers.append(key, value.toString());
          });

          // Get body from request
          let body = "";
          request.on("data", (chunk) => (body += chunk));
          request.on("end", async () => {
            // Create Fetch API-compatible request
            const req = new Request(
              `http://${request.headers.host}${(request as any).originalUrl}`,
              {
                method: request.method,
                headers,
                body: body || undefined,
              },
            );

            // Process authentication request
            const response = await this.auth.handler(req);

            // Set headers and status code
            reply.setHeaders(response.headers);
            reply.statusCode = response.status;

            // Forward response to client
            reply.end(response.body ? await response.text() : null);

            next();
          });
        })
        .forRoutes({ path: `${basePath}/*path`, method: RequestMethod.ALL });
    } else {
      throw new Error("Invalid routing provider");
    }

    this.logger.log("AuthModule initialized with BetterAuth");
  }
}
