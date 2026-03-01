/**
 * CancelKit Embed Widget
 *
 * This package provides the embeddable cancel flow widget that SaaS products
 * can include on their cancellation pages.
 *
 * TODO: Implement the cancel flow widget in a future sprint.
 */

export interface CancelKitConfig {
  /** Your CancelKit flow ID */
  flowId: string;
  /** Optional: end user identifier for tracking */
  userId?: string;
  /** Optional: callback when user saves (doesn't cancel) */
  onSaved?: () => void;
  /** Optional: callback when user cancels */
  onCancelled?: () => void;
}

// Placeholder — widget implementation coming in Sprint 2
export function initCancelKit(_config: CancelKitConfig): void {
  // eslint-disable-next-line no-console
  console.log("[CancelKit] Widget not yet implemented.");
}
