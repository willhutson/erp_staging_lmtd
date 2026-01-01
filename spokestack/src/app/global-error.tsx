"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif"
        }}>
          <h2 style={{ marginBottom: "1rem" }}>Something went wrong!</h2>
          <p style={{ color: "#666", marginBottom: "0.5rem" }}>
            {error.message || "An unexpected error occurred."}
          </p>
          {error.digest && (
            <p style={{ color: "#999", fontSize: "0.875rem", marginBottom: "1rem" }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#52EDC7",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
