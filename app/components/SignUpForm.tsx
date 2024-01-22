"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  FormGroup,
  CircularProgress,
  Stack,
  Alert,
} from "@mui/material";
import Link from "next/link";
import SignUpWithGoogleButton from "./SignUpWithGoogleButton";
import { useRouter } from "next/navigation";

interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}

function SignUpForm() {
  const { push } = useRouter();
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [registerError, setRegisterError] = useState<any>(undefined);
  const [loading, setLoading] = useState<true | false>(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(userInfo);

    try {
      const response = await axios.post<RegisterResponse>(
        `${process.env.NEXT_PUBLIC_SPRING_BOOT_BACKEND_PATH}/auth/register`,
        {
          username: userInfo.username,
          email: userInfo.email,
          password: userInfo.password,
          redirect: false,
        }
      );
      console.log("Registration successful");
      console.log(response);
      push("/signin");
    } catch (error) {
      console.error("Registration error:", error);
      setRegisterError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRegisterErrorAlert = () => {
    setRegisterError(undefined);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup row className="block container">
        <p className="text-[40px] mb-10 font-semibold text-black">
          Create Account
        </p>
        <TextField
          id="username-sign-up-text-field"
          label="Username"
          variant="outlined"
          type="username"
          className="w-full mb-4 rounded-lg border border-black mx-auto pb-3"
          onChange={({ target }) =>
            setUserInfo({ ...userInfo, username: target.value })
          }
        />
        <TextField
          id="email-sign-up-text-field"
          label="Email"
          variant="outlined"
          type="email"
          className="w-full mb-4 rounded-lg border border-black mx-auto pb-3"
          onChange={({ target }) =>
            setUserInfo({ ...userInfo, email: target.value })
          }
        />
        <TextField
          id="password-sign-up-text-field"
          label="Password"
          variant="outlined"
          type="password"
          className="w-full mb-4 rounded-lg border border-black mx-auto pb-3"
          onChange={({ target }) =>
            setUserInfo({ ...userInfo, password: target.value })
          }
        />
        <TextField
          id="confirm-password-sign-up-text-field"
          label="Confirm password"
          variant="outlined"
          type="password"
          className="w-full mb-4 rounded-lg border border-black mx-auto pb-3"
        />
        {registerError && (
          <Stack spacing={2} sx={{ width: "100%" }}>
            <Alert severity="error" onClose={handleCloseRegisterErrorAlert}>
              <span className="font-bold">Registration error </span>
              {registerError?.response?.data}
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
            {loading ? (
              <CircularProgress size={32} color="inherit" />
            ) : (
              "Create Account"
            )}
          </p>
        </Button>
        <div className="pt-10">
          <span className="text-base font-semibold text-center text-black/70">
            Already have an account?
          </span>
          <Link href="/signin">
            <span className="text-base font-semibold text-center text-[#4285f4] pl-2 cursor-pointer">
              Login
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
      </FormGroup>
    </form>
  );
}

export default SignUpForm;
