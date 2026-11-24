// What the push service answered one delivery: GONE is a subscription it no longer knows (404, 410), forgotten (R11).
export const PushDeliveryOutcomeEnum = {
    DELIVERED: 'DELIVERED',
    GONE: 'GONE',
    FAILED: 'FAILED',
} as const;

export type PushDeliveryOutcome =
    (typeof PushDeliveryOutcomeEnum)[keyof typeof PushDeliveryOutcomeEnum];
