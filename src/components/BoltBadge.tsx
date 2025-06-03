import React from "react";
import { createPortal } from "react-dom";

export default function BoltBadge() {
  return createPortal(
    <a
      href="https://bolt.new"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 9999,
        transition: "transform 0.2s",
        display: "inline-block",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <img
        src="/white_circle_360x360.png"
        alt="Powered by Bolt"
        style={{
          width: "clamp(45px, 8vw, 85px)",
          height: "clamp(45px, 8vw, 85px)",
          maxWidth: "85px",
          maxHeight: "85px",
          objectFit: "contain",
        }}
      />
    </a>,
    document.body
  );
}
