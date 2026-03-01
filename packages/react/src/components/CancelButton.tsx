import React, { useState } from "react";
import { CancelModal } from "./CancelModal";
import type { SaveEvent, CancelEvent } from "../types";

export interface CancelButtonProps {
  /** The cancel flow ID to trigger on click */
  flowId: string;
  /** CancelKit API base URL */
  apiUrl: string;
  /** Your public widget API key */
  apiKey: string;
  /** End-user identifier (e.g. Stripe customer ID or user ID) */
  userId: string;
  /** Called when the user accepts a retention offer */
  onSaved?: (event: SaveEvent) => void;
  /** Called when the user proceeds to cancel */
  onCanceled?: (event: CancelEvent) => void;
  /** Button content */
  children?: React.ReactNode;
  /** Additional class names for the button */
  className?: string;
  /** Additional inline styles for the button */
  style?: React.CSSProperties;
}

/**
 * CancelButton — drop-in replacement for your "Cancel subscription" button.
 * When clicked, it opens the CancelKit flow modal instead of canceling immediately.
 *
 * @example
 * <CancelButton
 *   flowId="abc123"
 *   apiUrl="https://app.cancelkit.com"
 *   apiKey="ck_live_xxxx"
 *   userId={user.stripeCustomerId}
 *   onSaved={() => toast("Offer applied!")}
 *   onCanceled={() => router.push("/goodbye")}
 * >
 *   Cancel subscription
 * </CancelButton>
 */
export function CancelButton({
  flowId,
  apiUrl,
  apiKey,
  userId,
  onSaved,
  onCanceled,
  children = "Cancel subscription",
  className,
  style,
}: CancelButtonProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleSaved(event: SaveEvent) {
    setIsOpen(false);
    onSaved?.(event);
  }

  function handleCanceled(event: CancelEvent) {
    setIsOpen(false);
    onCanceled?.(event);
  }

  return (
    <>
      <button onClick={handleClick} className={className} style={style}>
        {children}
      </button>

      {isOpen && (
        <CancelModal
          flowId={flowId}
          apiUrl={apiUrl}
          apiKey={apiKey}
          userId={userId}
          onSaved={handleSaved}
          onCanceled={handleCanceled}
          onClose={handleClose}
        />
      )}
    </>
  );
}
