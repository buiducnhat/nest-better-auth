import { betterAuth } from "better-auth";
import { getSession } from "better-auth/api";

export type UserSession = NonNullable<Awaited<ReturnType<ReturnType<typeof getSession>>>>;
export type User = UserSession["user"];

export type RoutingProvider = "express" | "fastify";

export interface AuthModuleOptions {
  betterAuth: ReturnType<typeof betterAuth>;
  options?: {
    routingProvider?: RoutingProvider;
    jsonParser?: boolean;
  };
}
