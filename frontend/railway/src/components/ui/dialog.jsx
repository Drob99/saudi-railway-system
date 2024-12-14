import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export const Dialog = ({
  open,
  onOpenChange,
  children,
  className = "",
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onOpenChange]);

  const handleBackdropClick = (event) => {
    if (event.target === dialogRef.current) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={`
        fixed inset-0 z-50 
        bg-black/50 backdrop-blur-sm
        flex items-center justify-center
        p-4
        ${className}
      `}
    >
      <div
        className={`
          bg-white rounded-lg shadow-xl
          w-full max-w-md
          transform transition-all duration-200
          scale-100 opacity-100 motion-preset-slide-up-md
          ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

// Helper components for dialog
export const DialogContent = ({ children, className = "" }) => (
  <div className={`p-6  ${className}`}>{children}</div>
);

export const DialogHeader = ({ children, className = "" }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const DialogTitle = ({ children, className = "" }) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h2>
);

export const DialogDescription = ({ children, className = "" }) => (
  <p className={`mt-2 text-sm text-gray-500 ${className}`}>{children}</p>
);

export const DialogFooter = ({ children, className = "" }) => (
  <div 
    className={`
      mt-6 flex justify-end gap-3
      border-t border-gray-100 pt-4
      ${className}
    `}
  >
    {children}
  </div>
);