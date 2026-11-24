'use client';

import { useAgendaScreen } from '../../hooks/use-agenda-screen';
import type { AgendaCalendarScreen } from '../../view-models/agenda-screen.view-model';
import { AgendaCalendarView } from '../views/agenda-calendar.view';
import { AgendaDayView } from '../views/agenda-day.view';

// The page keys this container by the day and month it read: a new reading starts from its own chosen day.
export function AgendaCalendarContainer({
    viewModel,
}: {
    readonly viewModel: AgendaCalendarScreen;
}) {
    const screen = useAgendaScreen(viewModel);
    // Only days the view model holds are ever chosen: the initial one and the tapped ones of the grid.
    const day = viewModel.days[screen.selectedDay];
    return (
        <>
            <AgendaCalendarView
                calendar={viewModel.calendar}
                selectedDay={screen.selectedDay}
                onSelectDay={screen.selectDay}
                onChangeMonth={screen.showMonth}
            />
            {day === undefined ? null : <AgendaDayView day={day} />}
        </>
    );
}
