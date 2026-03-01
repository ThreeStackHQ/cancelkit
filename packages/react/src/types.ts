// ─── Config ───────────────────────────────────────────────────────────────────

export interface CancelKitConfig {
  /** CancelKit API base URL (e.g. "https://app.cancelkit.com") */
  apiUrl: string;
  /** Your public widget API key */
  apiKey: string;
  /** The end-user's identifier (e.g. their Stripe customer ID or user ID) */
  userId: string;
}

// ─── Events ───────────────────────────────────────────────────────────────────

export interface SaveEvent {
  /** The flow that was shown */
  flowId: string;
  /** Type of offer that was accepted */
  offerType: "discount" | "pause" | "downgrade" | "custom";
  /** The offer value (e.g. "20" for 20% off, a price_id for downgrade) */
  offerValue: string;
}

export interface CancelEvent {
  /** The flow that was shown */
  flowId: string;
  /** Timestamp when the user chose to cancel */
  canceledAt: Date;
}

// ─── Step Data ────────────────────────────────────────────────────────────────

export interface FlowStepOption {
  label: string;
  value: string;
}

export interface FlowStep {
  id: string;
  order: number;
  type: "question" | "offer" | "confirmation";
  title: string;
  body?: string;
  options?: FlowStepOption[];
  offerType?: "discount" | "pause" | "downgrade" | "custom";
  offerValue?: string;
}

export interface FlowConfig {
  id: string;
  name: string;
  steps: FlowStep[];
}
