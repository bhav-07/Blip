import React from "react";

const BlipLogo = () => {
  return (
    <h1 className="text-white md:text-7xl text-5xl font-mono flex items-center justify-center gap-2">
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="md:size-12 size-9"
      >
        {" "}
        <g clipPath="url(#clip0_238_1296)">
          {" "}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M100 0H0L100 100H0L100 200H200L100 100H200L100 0Z"
            fill="url(#paint0_linear_238_1296)"
          />{" "}
        </g>{" "}
        <defs>
          {" "}
          <linearGradient
            id="paint0_linear_238_1296"
            x1="20.5"
            y1="16"
            x2="100"
            y2="200"
            gradientUnits="userSpaceOnUse"
          >
            {" "}
            <stop stopColor="#ACAAFF" /> <stop offset="1" stopColor="#C0E8FF" />{" "}
          </linearGradient>{" "}
          <clipPath id="clip0_238_1296">
            {" "}
            <rect width="200" height="200" fill="white" />{" "}
          </clipPath>{" "}
        </defs>{" "}
      </svg>
      Blip
    </h1>
  );
};

export default BlipLogo;
