"use client";

import React, { useState } from "react";
import {
  Button,
  TextField,
  FormGroup,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { signIn } from "next-auth/react";
import SignUpWithGoogleButton from "./SignUpWithGoogleButton";
import ForgotPasswordButton from "./ForgotPasswordButton";
import { useRouter } from "next/navigation";

function LoginForm() {
  const { push } = useRouter();
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState<any>(undefined);
  const [loading, setLoading] = useState<true | false>(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    setLoading(true);
    e.preventDefault();

    const res = await signIn("credentials", {
      email: userInfo.email,
      password: userInfo.password,
      callbackUrl: process.env.NEXT_PUBLIC_NEXT_FRONTEND_PATH,
      redirect: false,
    });
    console.log(res);

    if (res?.error) {
      setLoginError(res?.error);
    } else {
      push("/");
    }
    setLoading(false);
  };

  const handleCloseLoginErrorAlert = () => {
    setLoginError(undefined);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup row className="block container">
        <p className="text-[40px] mb-10 font-semibold text-black">Login</p>
        <TextField
          id="email-sign-in-text-field"
          label="Email"
          variant="outlined"
          type="email"
          className="w-full mb-4 rounded-lg border border-black mx-auto pb-3"
          onChange={({ target }) =>
            setUserInfo({ ...userInfo, email: target.value })
          }
        />
        <TextField
          id="password-sign-in-text-field"
          label="Password"
          variant="outlined"
          type="password"
          className="w-full mb-4 rounded-lg border border-black mx-auto pb-3"
          onChange={({ target }) =>
            setUserInfo({ ...userInfo, password: target.value })
          }
        />
        {loginError && (
          <Stack spacing={2} sx={{ width: "100%" }}>
            <Alert severity="error" onClose={handleCloseLoginErrorAlert}>
              <span className="font-bold">Login error </span>
              {loginError?.error
                ? loginError?.error
                : "Invalid email or password"}
            </Alert>
          </Stack>
        )}
        <Button
          variant="contained"
          type="submit"
          value="Login"
          disabled={loading}
          className="flex justify-center items-center w-full mt-6 gap-2.5 px-10 py-4 rounded-lg bg-[#1c3b29]"
        >
          <p className="flex-grow-0 flex-shrink-0 text-[32px] font-semibold text-center text-white">
            {loading ? <CircularProgress size={32} color="inherit" /> : "Login"}
          </p>
        </Button>
        <div className="pt-10">
          <span className="text-base font-semibold text-center text-black/70">
            Don't have an account?
          </span>
          <Link href="/signup">
            <span className="text-base font-semibold text-center text-[#4285f4] pl-2 cursor-pointer">
              Sign up
            </span>
          </Link>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="border-b w-1/3 lg:w-1/2"></span>
          <a
            href="/#"
            className="text-xs text-center text-gray-500 uppercase pl-10 pr-10"
          >
            or
          </a>
          <span className="border-b w-1/3 lg:w-1/2"></span>
        </div>
        <SignUpWithGoogleButton />
        <div className="mt-4 flex items-center justify-between pt-8">
          <span className="border-b w-full"></span>
        </div>
        <div>
          <ForgotPasswordButton />
        </div>
      </FormGroup>
    </form>
  );
}

export default LoginForm;
