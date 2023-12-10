import React from "react";

function ForgotPasswordButton() {
  return (
    <div className="flex items-center justify-center pt-8">
      <a
        href="#"
        className="flex items-center justify-center mt-4 text-white rounded-lg shadow-md hover:bg-gray-100 border border-black w-1/2"
      >
        <h1 className="px-4 py-3 w-5/6 text-center text-gray-600 font-bold">
          Forgot password?
        </h1>
      </a>
    </div>
  );
}

export default ForgotPasswordButton;
