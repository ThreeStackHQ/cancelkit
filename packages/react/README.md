# @cancelkit/react

React wrapper for CancelKit cancellation flows.

## Installation

```bash
npm install @cancelkit/react
# or
pnpm add @cancelkit/react
```

## Usage

```tsx
import { CancelButton, useCancelKit } from "@cancelkit/react";

// Component usage
function SubscriptionPage() {
  return (
    <CancelButton
      flowId="your-flow-id"
      customerId={user.id}
      onSaved={() => console.log("Subscription saved!")}
      onCancelled={() => console.log("Subscription cancelled.")}
    />
  );
}

// Hook usage
function CustomCancelFlow() {
  const { open, isOpen } = useCancelKit({
    flowId: "your-flow-id",
    customerId: user.id,
    onCancelled: () => router.push("/goodbye"),
  });

  return (
    <button onClick={open} disabled={isOpen}>
      Cancel my plan
    </button>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| flowId | string | required | Your CancelKit flow ID |
| customerId | string | required | The customer's ID |
| apiUrl | string | undefined | Custom API URL override |
| onSaved | function | undefined | Called when customer keeps subscription |
| onCancelled | function | undefined | Called when customer cancels |
| children | ReactNode | "Cancel Subscription" | Button label |
| className | string | undefined | CSS class |
| style | CSSProperties | undefined | Inline styles |
