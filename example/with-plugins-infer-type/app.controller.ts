import { IsPublic, Session, type User, type UserSession } from "../../src";
import { auth } from "./auth";
import { Controller, Get } from "@nestjs/common";
import { CurrentUser } from "src/decorators/current-user.decorator";

@Controller()
export class AppController {
  @IsPublic()
  @Get("public")
  public() {
    return "public";
  }

  @Get("private")
  private() {
    return "private";
  }

  @Get("me")
  getMe(@CurrentUser() user: User<typeof auth.options>) {
    console.log(user.role); // Role is inferred from the plugins admin()
    return user;
  }

  @Get("session")
  getSession(@Session() session: UserSession<typeof auth.options>) {
    console.log(session.user.role); // Role is inferred from the plugins admin()
    return session;
  }
}
