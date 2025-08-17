import { IsPublic, type User } from "../../src";
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
  getMe(@CurrentUser() user: User) {
    return user;
  }
}
