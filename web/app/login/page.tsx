"use client";

import { useRouter } from "next/navigation";
import API from "../api";
import React, { useState } from "react";
import BlipLogo from "@/components/blip-logo";
import Link from "next/link";
import Container from "@/components/container";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (username == "" || password == "") {
      setLoading(false);
      setErrorMessage("Username or Password cannot be empty");
      return;
    }

    try {
      const response = await API.post("/api/auth/login", {
        username,
        password,
      });
      console.log(response);
      if (response.data.error) {
        setErrorMessage(
          response.data.message || "Login failed, Please try again."
        );
        return;
      }
      router.push("/joinroom");
    } catch (error) {
      console.error("Login failed", error);
      setErrorMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="w-[480px]">
      {/* <HomeButton /> */}
      <form onSubmit={handleSubmit}>
        <div className="text-base font-semibold text-white space-y-4 flex flex-col">
          <BlipLogo />
          <h1 className="text-neutral-400">Login to continue</h1>
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
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="bg-black rounded-md p-3 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <span className="loader"></span> : "Login"}
          </button>
          <Link
            className="text-start font-thin hover:underline text-neutral-300"
            href={"/signup"}
          >
            Do not have an account? Signup instead
          </Link>
        </div>
      </form>
    </Container>
  );
}

export default Login;
