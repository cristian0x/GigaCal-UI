"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@mui/material";

function SignOutButton() {
  return (
    <Button
      variant="contained"
      className="flex justify-center items-center rounded-lg bg-black"
      onClick={() => signOut()}
    >
      <p className="flex-grow-0 flex-shrink-0 text-[32px] font-semibold text-center text-white">
        Sign out
      </p>
    </Button>
  );
}

export default SignOutButton;
