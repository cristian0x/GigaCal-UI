import * as React from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import SignOutButton from "./SignOutButton";

function Header(props: any) {
  return (
    <nav className="bg-[#1C3B29] flex w-screen items-stretch justify-between gap-5 px-8 py-2.5 border-[0.25px] border-solid border-neutral-600 max-md:max-w-full max-md:flex-wrap max-md:px-5">
      <span className="flex gap-5 justify-center items-center align-middle">
        <img src="gigacalendarek.png" className="object-cover h-16" />
        <div className="text-white h-full text-[32px] align-middle items-center content-center p-3">
          GigaCal
        </div>
      </span>
      <span className="flex gap-5 justify-center items-center align-middle">
        <SettingsIcon
          fontSize="large"
          className="flex aspect-square object-contain object-center w-10 items-center overflow-hidden shrink-0 max-w-full my-auto cursor-pointer"
          onClick={() => props.setSettingsModal(true)}
        />
        <SignOutButton />
      </span>
    </nav>
  );
}

export default Header;
