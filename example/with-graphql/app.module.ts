import { AuthModule } from "../../src";
import { AppResolver } from "./app.resolver";
import { GqlAuthGuard } from "./auth.guard";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { GraphQLModule } from "@nestjs/graphql";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
    }),
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
  providers: [
    AppResolver,
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
  ],
})
export class AppModule {}
