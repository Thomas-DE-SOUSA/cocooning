'use client';

import { type RefObject, useEffect } from 'react';

// R5: the feed opens on its latest item, and follows a new one; reading older pages leaves the latest in place.
export function useScrollToLatest(
    latestRef: RefObject<HTMLDivElement | null>,
    latestId: string | null,
) {
    useEffect(() => {
        if (latestId === null) return;
        latestRef.current?.scrollIntoView({ block: 'end' });
    }, [latestRef, latestId]);
}
