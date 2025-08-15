import type { AuthModuleOptions } from "./types";
import { ConfigurableModuleBuilder } from "@nestjs/common";

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<AuthModuleOptions>().build();
