/**
 * CancelKit Embed Widget
 *
 * TypeScript type declarations for the CancelKit vanilla JS widget.
 * The actual widget implementation is in cancelkit.js (IIFE bundle).
 *
 * Usage:
 *   <script src="https://cdn.threestack.io/cancelkit/cancelkit.min.js"></script>
 *   <script>
 *     CancelKit.init({ apiUrl: 'https://yourapp.com', flowId: 'your-flow-id' });
 *     CancelKit.show({ customerId: 'cus_xxx', onSave: () => {}, onCancel: () => {} });
 *   </script>
 */

export interface CancelKitInitOptions {
  /** Base URL of your CancelKit installation (e.g. https://yourapp.com) */
  apiUrl?: string;
  /** The flow ID to render */
  flowId: string;
}

export interface CancelKitShowOptions {
  /** Stripe customer ID of the end user */
  customerId?: string;
  /** Called when user accepts a retention offer */
  onSave?: () => void;
  /** Called when user confirms cancellation */
  onCancel?: () => void;
}

export interface CancelKitStatic {
  /** Initialize the widget with your flow config */
  init(opts: CancelKitInitOptions): void;
  /** Show the cancel flow modal */
  show(opts?: CancelKitShowOptions): void;
}

declare global {
  interface Window {
    CancelKit: CancelKitStatic;
  }
}

export {};
