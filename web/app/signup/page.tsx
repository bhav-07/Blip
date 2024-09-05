"use client";

import React from "react";

const Signup = () => {
  function handleSubmit() {
    console.log("SUBMITTED");
  }

  return (
    <div className="bg-container">
      <div className="chat-window">
        {/* <HomeButton /> */}
        <form onSubmit={handleSubmit} className="form">
          {/* <div className="headings">Let's Get Started!</div>
          {errorMessage && (
            <span className="error-message">*{errorMessage}</span>
          )} */}
          <br />
          <div className="form-input-box">
            <input
              type="text"
              className="form-input"
              // value={username}
              // onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
            />
            <input
              type="password"
              className="form-input"
              // value={password}
              // onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a Strong Password"
            />
          </div>
          <button type="submit" className="form-button">
            Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
