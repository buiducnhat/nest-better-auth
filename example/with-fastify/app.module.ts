import { AuthGuard, AuthModule } from "../../src";
import { AppController } from "./app.controller";
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";

@Module({
  imports: [
    // Use static forRoot by passing the betterAuth instance and options
    AuthModule.forRoot({
      betterAuth: betterAuth({
        basePath: "/auth",
        secret: "123qwe",
        emailAndPassword: {
          enabled: true,
        },
        plugins: [bearer()],
      }),
      options: {
        routingProvider: "fastify",
      },
    }),
    // // Use forRootAsync by passing a factory function that returns the betterAuth instance and options
    // // For example, we can inject the config service, the database instance, etc.
    // AuthModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     betterAuth: betterAuth({
    //       basePath: "/auth",
    //       secret: configService.get("betterAuthSecret"),
    //       emailAndPassword: {
    //         enabled: true,
    //       },
    //     }),
    //     options: {
    //       routingProvider: "express",
    //       jsonParser: true,
    //     },
    //   }),
    // }),
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
