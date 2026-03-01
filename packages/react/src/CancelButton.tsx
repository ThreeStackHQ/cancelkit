"use client";
import React from "react";
import { useCancelKit } from "./hooks";
import type { CancelButtonProps } from "./types";

export function CancelButton({
  flowId,
  customerId,
  apiUrl,
  onSaved,
  onCancelled,
  children,
  className,
  style,
}: CancelButtonProps) {
  const { open } = useCancelKit({ flowId, customerId, apiUrl, onSaved, onCancelled });

  return (
    <button
      onClick={open}
      className={className}
      style={style}
    >
      {children ?? "Cancel Subscription"}
    </button>
  );
}
