export type PushPublicKeyView = {
    readonly publicKey: string;
};

export const toPushPublicKeyView = (publicKey: string): PushPublicKeyView => ({
    publicKey,
});
