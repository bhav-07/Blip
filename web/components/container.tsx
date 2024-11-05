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
      className={`bg-white bg-opacity-10 backdrop-blur-lg drop-shadow-lg w-[500px] text-popover rounded-lg sm:p-16 p-4 m-2 sm:m-0 text-center space-y-4 ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
