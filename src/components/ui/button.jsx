import React from "react";

export function Button({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-blue-600 text-white rounded px-4 py-2 disabled:bg-gray-400 hover:bg-blue-700 transition-colors duration-200`}
    >
      {children}
    </button>
  );
}
