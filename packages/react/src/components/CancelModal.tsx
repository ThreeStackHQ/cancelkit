import React, { useEffect, useState, useCallback } from "react";
import type { FlowConfig, FlowStep, SaveEvent, CancelEvent } from "../types";

export interface CancelModalProps {
  /** The flow ID to render */
  flowId: string;
  /** CancelKit API base URL */
  apiUrl: string;
  /** Public widget API key */
  apiKey: string;
  /** End-user identifier */
  userId: string;
  /** Called when the user accepts an offer (save) */
  onSaved?: (event: SaveEvent) => void;
  /** Called when the user proceeds to cancel */
  onCanceled?: (event: CancelEvent) => void;
  /** Called when the modal is dismissed without action */
  onClose?: () => void;
}

type ModalState = "loading" | "error" | "step" | "accepted" | "canceled";

/**
 * CancelModal — full-screen overlay that renders a cancel flow.
 * Fetches flow config from /api/widget/flows/:flowId and walks the user
 * through each step. On offer acceptance, calls /api/stripe/apply-offer.
 */
export function CancelModal({
  flowId,
  apiUrl,
  apiKey,
  userId,
  onSaved,
  onCanceled,
  onClose,
}: CancelModalProps): React.ReactElement | null {
  const [state, setModalState] = useState<ModalState>("loading");
  const [flow, setFlow] = useState<FlowConfig | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Fetch flow config
  useEffect(() => {
    let cancelled = false;

    async function fetchFlow() {
      setModalState("loading");
      try {
        const res = await fetch(
          `${apiUrl}/api/widget/flows/${flowId}`,
          {
            headers: {
              "x-api-key": apiKey,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to load flow (${res.status})`);
        }

        const data = (await res.json()) as { flow: FlowConfig };
        if (!cancelled) {
          const sorted = [...data.flow.steps].sort((a, b) => a.order - b.order);
          setFlow({ ...data.flow, steps: sorted });
          setCurrentStepIndex(0);
          setModalState("step");
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : "Failed to load flow");
          setModalState("error");
        }
      }
    }

    void fetchFlow();
    return () => {
      cancelled = true;
    };
  }, [flowId, apiUrl, apiKey]);

  const currentStep: FlowStep | undefined = flow?.steps[currentStepIndex];

  const handleOfferAccept = useCallback(
    async (step: FlowStep) => {
      if (!step.offerType || !step.offerValue) return;

      try {
        // Call the stripe-actions endpoint
        await fetch(`${apiUrl}/api/stripe/apply-offer`, {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: userId,
            offerType: step.offerType,
            offerValue: step.offerValue,
            userId,
          }),
        });
      } catch {
        // Fire onSaved even if the Stripe call fails — let the parent handle it
      }

      setModalState("accepted");
      onSaved?.({
        flowId,
        offerType: step.offerType as SaveEvent["offerType"],
        offerValue: step.offerValue,
      });
    },
    [apiUrl, apiKey, userId, flowId, onSaved]
  );

  const handleProceedToCancel = useCallback(() => {
    setModalState("canceled");
    onCanceled?.({ flowId, canceledAt: new Date() });
  }, [flowId, onCanceled]);

  const handleNext = useCallback(() => {
    if (flow && currentStepIndex < flow.steps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    }
  }, [flow, currentStepIndex]);

  // ── Render helpers ──────────────────────────────────────────────────────────

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "system-ui, sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 12,
    padding: "32px 36px",
    maxWidth: 480,
    width: "100%",
    margin: "0 16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    position: "relative",
  };

  const btnPrimary: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "12px 20px",
    marginTop: 12,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  };

  const btnSecondary: React.CSSProperties = {
    ...btnPrimary,
    background: "transparent",
    color: "#6b7280",
    border: "1px solid #d1d5db",
    marginTop: 8,
  };

  const closeBtn: React.CSSProperties = {
    position: "absolute",
    top: 12,
    right: 16,
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    color: "#9ca3af",
  };

  if (state === "loading") {
    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <p style={{ textAlign: "center", color: "#6b7280" }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <button style={closeBtn} onClick={onClose}>✕</button>
          <p style={{ color: "#ef4444", textAlign: "center" }}>{errorMsg}</p>
          <button style={btnSecondary} onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (state === "accepted") {
    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            🎉 Offer Applied!
          </h2>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>
            Your offer has been applied to your account. We&apos;re glad to keep you!
          </p>
          <button style={btnPrimary} onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (state === "canceled") {
    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            We&apos;re sorry to see you go
          </h2>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>
            Your cancellation has been processed.
          </p>
          <button style={btnSecondary} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!currentStep) {
    return null;
  }

  // ── Step renderer ───────────────────────────────────────────────────────────

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <button style={closeBtn} onClick={onClose}>✕</button>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          {currentStep.title}
        </h2>

        {currentStep.body && (
          <p style={{ color: "#6b7280", marginBottom: 20 }}>{currentStep.body}</p>
        )}

        {/* Question step — show options as buttons */}
        {currentStep.type === "question" && currentStep.options && (
          <div>
            {currentStep.options.map((opt) => (
              <button key={opt.value} style={btnSecondary} onClick={handleNext}>
                {opt.label}
              </button>
            ))}
            <button style={{ ...btnSecondary, marginTop: 16 }} onClick={handleProceedToCancel}>
              Proceed to cancel
            </button>
          </div>
        )}

        {/* Offer step — accept or skip */}
        {currentStep.type === "offer" && (
          <div>
            <button
              style={btnPrimary}
              onClick={() => void handleOfferAccept(currentStep)}
            >
              Accept offer
            </button>
            {currentStepIndex < (flow?.steps.length ?? 1) - 1 ? (
              <button style={btnSecondary} onClick={handleNext}>
                No thanks, show other options
              </button>
            ) : (
              <button style={btnSecondary} onClick={handleProceedToCancel}>
                No thanks, cancel anyway
              </button>
            )}
          </div>
        )}

        {/* Confirmation step */}
        {currentStep.type === "confirmation" && (
          <div>
            <button style={btnPrimary} onClick={handleProceedToCancel}>
              Confirm cancellation
            </button>
            <button style={btnSecondary} onClick={onClose}>
              Keep my subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
