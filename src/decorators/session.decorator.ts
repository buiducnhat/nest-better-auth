import type { UserSession } from "../types";
import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const Session: ReturnType<typeof createParamDecorator> = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserSession => {
    const request = context.switchToHttp().getRequest();
    return request.session as UserSession;
  },
);
