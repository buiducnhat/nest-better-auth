import type { UserSession } from "../types";
import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const CurrentUser: ReturnType<typeof createParamDecorator> = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserSession["user"] => {
    const request = context.switchToHttp().getRequest();
    return request.session?.user;
  },
);
