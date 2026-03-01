import type { ReactNode, CSSProperties } from "react";

export interface CancelKitConfig {
  flowId: string;
  customerId: string;
  apiUrl?: string;
  onSaved?: () => void;
  onCancelled?: () => void;
}

export interface CancelButtonProps extends CancelKitConfig {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface UseCancelKitReturn {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}
