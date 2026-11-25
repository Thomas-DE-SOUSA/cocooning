import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { MessageFeedItemResponse } from '@cocooning/couple-contract/messaging';
import { useCallback, useState, useTransition } from 'react';
import type { OlderMessagesGateway } from '../gateways/ports/older-messages.gateway';

type OlderPages = {
    readonly items: readonly MessageFeedItemResponse[];
    readonly nextCursor: string | null;
};

// R5: older pages are read after the first one, by its cursor; a withdrawn item leaves them at once.
export function useOlderMessages(
    gateway: OlderMessagesGateway,
    firstCursor: string | null,
    onFailed: (error: ApiError) => void,
) {
    const [pages, setPages] = useState<OlderPages>({
        items: [],
        nextCursor: firstCursor,
    });
    const [isLoading, startTransition] = useTransition();
    const loadOlder = useCallback(() => {
        const cursor = pages.nextCursor;
        if (cursor === null) return;
        startTransition(async () => {
            const page = await gateway.listOlderMessages(cursor);
            if (!page.success) {
                onFailed(page.error);
                return;
            }
            setPages((loaded) => ({
                items: [...loaded.items, ...page.value.items],
                nextCursor: page.value.nextCursor,
            }));
        });
    }, [gateway, pages.nextCursor, onFailed]);
    const forget = useCallback((id: string) => {
        setPages((loaded) => ({
            ...loaded,
            items: loaded.items.filter((item) => item.id !== id),
        }));
    }, []);
    return {
        items: pages.items,
        hasOlder: pages.nextCursor !== null,
        isLoading,
        loadOlder,
        forget,
    };
}
