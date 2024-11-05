"use client";

import { useRouter } from "next/navigation";
import API from "../api";
import React, { useState } from "react";
import axios from "axios";
import BlipLogo from "@/components/blip-logo";
import Link from "next/link";
import Container from "@/components/container";

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
    <Container>
      <form onSubmit={handleSubmit}>
        <div className="font-semibold text-white space-y-4 flex flex-col">
          <BlipLogo />
          <h1 className="text-neutral-400">Let s Get Started!</h1>
          {errorMessage && (
            <span className="text-red-400">*{errorMessage}</span>
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
          <Link
            className="text-start font-thin hover:underline text-neutral-300"
            href={"/login"}
          >
            Have an account already? Login instead
          </Link>
        </div>
      </form>
    </Container>
  );
}

export default Signup;
