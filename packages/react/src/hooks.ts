"use client";
import { useState, useCallback, useEffect } from "react";
import type { CancelKitConfig, UseCancelKitReturn } from "./types";

export function useCancelKit(config: CancelKitConfig): UseCancelKitReturn {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load CancelKit widget script
    const scriptId = "cancelkit-widget";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdn.cancelkit.threestack.io/widget.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    if (typeof window !== "undefined" && (window as any).CancelKit) {
      (window as any).CancelKit.open({
        ...config,
        onSaved: () => {
          setIsOpen(false);
          config.onSaved?.();
        },
        onCancelled: () => {
          setIsOpen(false);
          config.onCancelled?.();
        },
      });
    }
  }, [config]);

  const close = useCallback(() => {
    setIsOpen(false);
    if (typeof window !== "undefined" && (window as any).CancelKit) {
      (window as any).CancelKit.close?.();
    }
  }, []);

  return { open, close, isOpen };
}
