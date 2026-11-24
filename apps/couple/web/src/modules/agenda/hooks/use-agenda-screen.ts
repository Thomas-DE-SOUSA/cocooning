import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useRefreshOnReturn } from '@/shared/application/refresh/use-refresh-on-return';
import { resolveAgendaHref } from '../presenters/agenda-href.presenter';
import { monthOf } from '../presenters/calendar-day.presenter';
import type { AgendaQuery } from '../view-models/agenda-query.view-model';

// The page reads the chosen day and month from its address (decision 0048): navigating is choosing.
export function useAgendaScreen() {
    const router = useRouter();
    const refresh = useCallback(() => router.refresh(), [router]);
    useRefreshOnReturn(refresh);
    const show = (query: AgendaQuery) =>
        router.push(resolveAgendaHref(query), { scroll: false });
    return {
        refresh,
        showDay: (day: string) => show({ day, month: monthOf(day) }),
        showMonth: (selectedDay: string, month: string) =>
            show({ day: selectedDay, month }),
    };
}
