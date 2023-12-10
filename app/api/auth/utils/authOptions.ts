import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authApi } from "@/app/api/auth/utils/authApi";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      type: "credentials",
      credentials: {},
      authorize: async (credentials) => {
        const creds = credentials as {
          email: string;
          password: string;
        };
        const user = await authApi(creds);

        if (user) {
          return Promise.resolve(user);
        } else {
          throw new Error("Invalid email or password");
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    jwt(params) {
      return params.token;
    },
  },
};
