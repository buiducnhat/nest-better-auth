import { IsPublic } from "../../src";
import { Controller, Get } from "@nestjs/common";

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
}
