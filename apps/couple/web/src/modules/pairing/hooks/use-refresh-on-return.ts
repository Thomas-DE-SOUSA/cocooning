import { useEffect } from 'react';

// Decision 0036: the other partner may have joined while the PWA was in the background.
export function useRefreshOnReturn(refresh: () => void): void {
    useEffect(() => {
        const refreshWhenVisible = () => {
            if (document.visibilityState === 'visible') refresh();
        };
        document.addEventListener('visibilitychange', refreshWhenVisible);
        return () =>
            document.removeEventListener(
                'visibilitychange',
                refreshWhenVisible,
            );
    }, [refresh]);
}
