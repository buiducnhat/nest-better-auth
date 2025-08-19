import { AuthGuard, AuthModule } from "../../src";
import { AppController } from "./app.controller";
import { auth } from "./auth";
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

@Module({
  imports: [
    // Use static forRoot by passing the betterAuth instance and options
    AuthModule.forRoot({
      betterAuth: auth,
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
