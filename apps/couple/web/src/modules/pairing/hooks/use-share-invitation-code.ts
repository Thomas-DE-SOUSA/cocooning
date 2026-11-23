import { useCallback } from 'react';

type Options = {
    readonly onCopied: () => void;
    readonly onShareFailed: () => void;
};

const isDismissedShareSheet = (error: unknown) =>
    error instanceof DOMException && error.name === 'AbortError';

// The share sheet of the phone first (messages, mail), the clipboard where the browser has none.
export function useShareInvitationCode({ onCopied, onShareFailed }: Options) {
    return useCallback(
        async (text: string) => {
            try {
                if (typeof navigator.share === 'function') {
                    await navigator.share({ text });
                    return;
                }
                await navigator.clipboard.writeText(text);
                onCopied();
            } catch (error) {
                if (isDismissedShareSheet(error)) return;
                onShareFailed();
            }
        },
        [onCopied, onShareFailed],
    );
}
