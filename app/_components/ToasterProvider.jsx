"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
        },
        success: {
          duration: 3000,
          theme: { primary: "green", secondary: "black" },
        },
        error: {
          duration: 5000,
          theme: { primary: "red", secondary: "black" },
        },
      }}
    />
  );
}
