"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

const Signup = () => {
  function handleSubmit() {
    console.log("SUBMITTED");
  }

  return (
    <div className="">
      <div className="">
        {/* <HomeButton /> */}
        <form onSubmit={handleSubmit} className="bg-foreground p-12">
          <div className="text-3xl font-bold text-black">Lets Get Started!</div>
          {/* {errorMessage && (
            <span className="error-message">*{errorMessage}</span>
          )} */}
          <br />
          <div className="space-y-3">
            <Input
              type="text"
              className="rounded-xl"
              // value={username}
              // onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
            />
            <Input
              type="password"
              className="rounded-xl"
              // value={password}
              // onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a Strong Password"
            />
            <Button type="submit" className="rounded-xl w-full">
              Signup
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
