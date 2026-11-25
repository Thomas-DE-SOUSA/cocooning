import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useRefreshOnReturn } from '@/shared/application/refresh/use-refresh-on-return';

// Decision 0036: the page reads the feed and the prompt again on retry and when the PWA comes back to the foreground.
export function useMessagesRefresh(): () => void {
    const router = useRouter();
    const refresh = useCallback(() => router.refresh(), [router]);
    useRefreshOnReturn(refresh);
    return refresh;
}
