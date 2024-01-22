"use client";

import React from "react";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

function SignOutButton() {
  const { push } = useRouter();

  return (
    <Button
      variant="contained"
      className="flex justify-center items-center rounded-lg bg-black"
      onClick={() => {
        sessionStorage.removeItem("token");
        push("/signin");
      }}
    >
      <p className="flex-shrink-0 text-[16px] font-semibold text-center text-white">
        Sign out
      </p>
    </Button>
  );
}

export default SignOutButton;
