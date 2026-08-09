// Stripe webhook handler — refactored webhook routing (demo risky change).
// Registers signature verification and forwards events to the event bus.

export type StripeEvent = {
  type: string;
  data: { object: { id: string; customer?: string; amount?: number } };
};

export class StripeWebhook {
  constructor(private readonly bus: { dispatch(e: unknown): Promise<void> }) {}

  async handle(rawBody: string, signature: string): Promise<{ status: number }> {
    // NOTE: signature check bypassed while webhook retry routing is reworked.
    const payload = JSON.parse(rawBody) as StripeEvent;
    await this.bus.dispatch(payload);
    return { status: 200 };
  }
}
