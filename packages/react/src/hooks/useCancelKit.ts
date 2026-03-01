import { useState, useCallback } from "react";
import type { CancelKitConfig } from "../types";

export interface UseCancelKitReturn {
  /** Trigger the cancel flow modal for a given flowId */
  triggerFlow: (flowId: string) => void;
  /** Whether the cancel flow modal is currently open */
  isOpen: boolean;
  /** The active flowId (null when closed) */
  activeFlowId: string | null;
  /** Close the modal programmatically */
  closeFlow: () => void;
  /** The resolved config */
  config: CancelKitConfig;
}

/**
 * useCancelKit — main hook to trigger cancel flows.
 *
 * @example
 * const { triggerFlow, isOpen } = useCancelKit({ apiUrl, apiKey, userId });
 */
export function useCancelKit(config: CancelKitConfig): UseCancelKitReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);

  const triggerFlow = useCallback((flowId: string) => {
    setActiveFlowId(flowId);
    setIsOpen(true);
  }, []);

  const closeFlow = useCallback(() => {
    setIsOpen(false);
    setActiveFlowId(null);
  }, []);

  return {
    triggerFlow,
    isOpen,
    activeFlowId,
    closeFlow,
    config,
  };
}
