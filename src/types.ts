import { BetterAuthOptions, betterAuth } from "better-auth";
import { getSession } from "better-auth/api";

export type UserSession<T extends BetterAuthOptions = BetterAuthOptions> = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getSession<T>>>>
>;
export type User<T extends BetterAuthOptions = BetterAuthOptions> = UserSession<T>["user"];

export type RoutingProvider = "express" | "fastify";

export interface AuthModuleOptions {
  betterAuth: ReturnType<typeof betterAuth>;
  options?: {
    routingProvider?: RoutingProvider;
    jsonParser?: boolean;
  };
}
