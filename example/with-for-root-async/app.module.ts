import { AuthGuard, AuthModule } from "../../src";
import { AppController } from "./app.controller";
import configuration from "./config/configuration";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    AuthModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        betterAuth: betterAuth({
          basePath: configService.get("betterAuth.basePath"),
          secret: configService.get("betterAuth.secret"),
          emailAndPassword: {
            enabled: true,
          },
          plugins: [bearer()],
          logger: {
            // Convert to nestjs logger
            log(level, message, ...args) {
              const logger = new Logger(AuthModule.name);
              logger[level](message, ...args);
            },
          },
        }),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
