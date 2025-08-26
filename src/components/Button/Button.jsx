// src/components/Button/Button.jsx
import React from "react";
import styles from "./Button.module.css";

const Button = ({
  children,
  onClick,
  type = "button",
  className = "",
  unstyled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${unstyled ? "" : styles.button} ${className}`}
    >
      {children}
    </button>
  );
};


export default Button;
