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
    }

    this.logger.log("AuthModule initialized with BetterAuth");
  }
}
