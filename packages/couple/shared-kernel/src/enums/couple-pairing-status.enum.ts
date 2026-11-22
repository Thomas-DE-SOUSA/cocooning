export const CouplePairingStatusEnum = {
    PENDING: 'PENDING',
    PAIRED: 'PAIRED',
} as const;

export type CouplePairingStatus =
    (typeof CouplePairingStatusEnum)[keyof typeof CouplePairingStatusEnum];
