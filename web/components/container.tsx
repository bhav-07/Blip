import React, { ReactNode } from "react";

interface CustomContainerProps {
  children: ReactNode;
  className?: string;
}

const Container: React.FC<CustomContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`bg-white bg-opacity-10 bg-clip-padding backdrop-filter backdrop-blur-sm animate-in fade-in-0 duration-1000 ease-in-out text-popover rounded-lg sm:p-16 p-4 m-2 sm:m-0 text-center space-y-4 ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
