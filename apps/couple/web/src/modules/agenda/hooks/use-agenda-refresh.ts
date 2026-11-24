import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useRefreshOnReturn } from '@/shared/application/refresh/use-refresh-on-return';

// Decision 0036: the page reads the agenda again on retry and when the PWA comes back to the foreground.
export function useAgendaRefresh(): () => void {
    const router = useRouter();
    const refresh = useCallback(() => router.refresh(), [router]);
    useRefreshOnReturn(refresh);
    return refresh;
}
