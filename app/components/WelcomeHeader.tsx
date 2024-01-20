import React from "react";
import { Lily_Script_One } from "next/font/google";

const lilyScriptOne = Lily_Script_One({ weight: "400", subsets: ["latin"] });

function WelcomeHeader() {
  return (
    <div className="justify-center text-center text-[#1c3b29] pb-[4rem] text-7xl leading-[103px] max-md:text-4xl max-md:leading-[61px]">
      <span className={lilyScriptOne.className}>Welcome to GigaCal!</span>
    </div>
  );
}

export default WelcomeHeader;
