import React from "react";

const PageTransition = ({ children, className = "" }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default PageTransition;
