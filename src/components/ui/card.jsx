// src/ui/card.jsx
import React from "react";

export function Card({ children, className }) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className || ""}`}>
      {children}
    </div>
  );
}

// اگر لازم داری CardContent هم اضافه کن:
export function CardContent({ children, className }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
