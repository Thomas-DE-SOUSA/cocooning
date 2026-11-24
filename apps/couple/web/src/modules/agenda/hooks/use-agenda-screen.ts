import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { resolveAgendaHref } from '../presenters/agenda-href.presenter';
import { monthOf } from '../presenters/calendar-day.presenter';
import type { AgendaCalendarScreen } from '../view-models/agenda-screen.view-model';

// Decision 0048: a day of the grid is chosen in the browser, its address kept in step without the server; a month goes through the server.
export function useAgendaScreen(screen: AgendaCalendarScreen) {
    const router = useRouter();
    const [selectedDay, setSelectedDay] = useState(screen.initialDay);
    const navigate = (day: string, month: string) =>
        router.push(resolveAgendaHref({ day, month }), { scroll: false });
    return {
        selectedDay,
        selectDay: (day: string) => {
            if (!Object.hasOwn(screen.days, day)) {
                navigate(day, monthOf(day));
                return;
            }
            setSelectedDay(day);
            window.history.replaceState(
                null,
                '',
                resolveAgendaHref({ day, month: screen.calendar.month }),
            );
        },
        showMonth: (month: string) => navigate(selectedDay, month),
    };
}
