import { BETTER_AUTH_INSTANCE_TOKEN, IS_PUBLIC_KEY } from "./tokens";
import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Auth } from "better-auth";
import { APIError } from "better-auth/api";
import { fromNodeHeaders } from "better-auth/node";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
    @Inject(BETTER_AUTH_INSTANCE_TOKEN)
    private readonly auth: Auth,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    // Attach session and user to request
    request.session = session;
    request.user = session?.user ?? null;

    // Get isPublic from decorator before
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // If not public and no session, throw error
    if (!session)
      throw new APIError(HttpStatus.UNAUTHORIZED, {
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });

    return true;
  }
}
