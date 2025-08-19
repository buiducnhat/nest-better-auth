import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  basePath: "/auth",
  secret: "123qwe",
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()],
});
