# @cancelkit/react

React SDK for [CancelKit](https://cancelkit.threestack.io) — embed cancel flows in your React app to reduce churn.

## Installation

```bash
npm install @cancelkit/react
# or
pnpm add @cancelkit/react
```

## Quick Start

### CancelButton (recommended)

The simplest integration — drop in a `CancelButton` where your current cancel link/button is:

```tsx
import { CancelButton } from '@cancelkit/react';

function BillingPage() {
  return (
    <CancelButton
      flowId="your-flow-id"
      apiUrl="https://app.cancelkit.com"
      apiKey="ck_live_xxxxxxxxxxxx"
      userId={user.stripeCustomerId}
      onSaved={(event) => {
        console.log('User saved!', event.offerType, event.offerValue);
        toast.success('Offer applied to your subscription!');
      }}
      onCanceled={(event) => {
        console.log('User canceled at', event.canceledAt);
        router.push('/dashboard?canceled=true');
      }}
      className="btn btn-danger"
    >
      Cancel subscription
    </CancelButton>
  );
}
```

### useCancelKit hook

For more control, use the hook directly:

```tsx
import { useCancelKit, CancelModal } from '@cancelkit/react';

function BillingPage() {
  const { triggerFlow, isOpen, activeFlowId, closeFlow } = useCancelKit({
    apiUrl: 'https://app.cancelkit.com',
    apiKey: 'ck_live_xxxxxxxxxxxx',
    userId: user.stripeCustomerId,
  });

  return (
    <>
      <button onClick={() => triggerFlow('your-flow-id')}>
        Cancel subscription
      </button>

      {isOpen && activeFlowId && (
        <CancelModal
          flowId={activeFlowId}
          apiUrl="https://app.cancelkit.com"
          apiKey="ck_live_xxxxxxxxxxxx"
          userId={user.stripeCustomerId}
          onSaved={(event) => {
            closeFlow();
            toast.success('Offer applied!');
          }}
          onCanceled={(event) => {
            closeFlow();
            router.push('/goodbye');
          }}
          onClose={closeFlow}
        />
      )}
    </>
  );
}
```

## API

### `CancelButton`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `flowId` | `string` | ✓ | The cancel flow ID from your CancelKit dashboard |
| `apiUrl` | `string` | ✓ | Your CancelKit app URL |
| `apiKey` | `string` | ✓ | Your public widget API key |
| `userId` | `string` | ✓ | End-user identifier (Stripe customer ID or user ID) |
| `onSaved` | `(event: SaveEvent) => void` | — | Called when user accepts a retention offer |
| `onCanceled` | `(event: CancelEvent) => void` | — | Called when user proceeds to cancel |
| `children` | `ReactNode` | — | Button label (default: "Cancel subscription") |
| `className` | `string` | — | CSS class for the button |
| `style` | `CSSProperties` | — | Inline styles for the button |

### `useCancelKit(config)`

```ts
const { triggerFlow, isOpen, activeFlowId, closeFlow, config } = useCancelKit({
  apiUrl: string;
  apiKey: string;
  userId: string;
});
```

### Types

```ts
interface SaveEvent {
  flowId: string;
  offerType: 'discount' | 'pause' | 'downgrade' | 'custom';
  offerValue: string;
}

interface CancelEvent {
  flowId: string;
  canceledAt: Date;
}
```

## License

MIT
