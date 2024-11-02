"use client";

import { useRouter } from "next/navigation";
import API from "../api";
import React, { useState } from "react";
import axios from "axios";
import BlipLogo from "@/components/blip-logo";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await API.post("/api/auth/signup", {
        username,
        password,
      });
      console.log(response);
      if (response.data.error) {
        console.log(response.data);
        setErrorMessage(
          response.data.message || "Signup failed, Please try again."
        );
        return;
      }
      console.log("Signup successful", response.data);
      router.push("/login");
    } catch (error) {
      console.error("Signup failed", error);
    }
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded drop-shadow-lg text-white w-[500px]">
      <div className="text-popover rounded-lg sm:p-16 p-4 m-2 sm:m-0 text-center space-y-4">
        {/* <HomeButton /> */}
        <form onSubmit={handleSubmit}>
          <div className="font-semibold text-white space-y-4 flex flex-col w-">
            <BlipLogo />
            <h1 className="text-neutral-400">Let s Get Started!</h1>
            {errorMessage && (
              <span className="error-message">*{errorMessage}</span>
            )}
            <br />
            <div className="flex flex-col">
              <label className="text-start pb-1 text-xl font-normal">
                Username
              </label>
              <input
                type="text"
                className="p-3 rounded-md text-black"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-start pb-1 text-xl font-normal">
                Password
              </label>
              <input
                type="password"
                className="p-3 rounded-md text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a Strong Password"
              />
            </div>
            <button type="submit" className="bg-black rounded-md p-3">
              Signup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
