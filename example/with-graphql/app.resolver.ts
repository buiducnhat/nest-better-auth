import { IsPublic, type User as UserType } from "../../src";
import { User } from "./models/user.model";
import { Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "src/decorators/current-user.decorator";

@Resolver()
export class AppResolver {
  @IsPublic()
  @Query(() => String)
  public() {
    return "public";
  }

  @Query(() => String)
  private() {
    return "private";
  }

  @Query(() => User)
  getMe(@CurrentUser() user: UserType) {
    return user;
  }
}
