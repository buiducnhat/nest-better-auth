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
        routingProvider: "express",
        jsonParser: true,
      },
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
