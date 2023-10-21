import React from "react";
import WelcomeHeader from "../components/WelcomeHeader";
import SignUpForm from "../components/SignUpForm";

const SignUpPage = () => {
  return (
    <>
      <div className="flex m-0 p-0">
        <div className="w-4/12 sm:w-4/12 max-lg:hidden">
          <div className="h-full bg-[#1c3b29] flex max-lg:hidden flex-row min-h-screen justify-center items-center">
            <img src="gigacalendarek.png" className="object-cover" />
          </div>
        </div>
        <div className="w-8/12 sm:w-8/12 grid h-full place-items-center mx-auto">
          <div className="my-10 lg:my-20 mx-10 w-7/12 max-lg:w-11/12">
            <div className="bg-white relative">
              <WelcomeHeader />
              <SignUpForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
