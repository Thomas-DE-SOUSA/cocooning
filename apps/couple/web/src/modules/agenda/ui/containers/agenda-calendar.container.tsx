'use client';

import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';
import { useAgendaScreen } from '../../hooks/use-agenda-screen';
import { useCalendarEventDrawer } from '../../hooks/use-calendar-event-drawer';
import { presentShortDay } from '../../presenters/day-label.presenter';
import type { AgendaCalendarScreen } from '../../view-models/agenda-screen.view-model';
import { NewCalendarEventButton } from '../components/new-calendar-event-button';
import { AgendaCalendarView } from '../views/agenda-calendar.view';
import { AgendaDayView } from '../views/agenda-day.view';
import { CalendarEventDrawerContainer } from './calendar-event-drawer.container';

// The page keys this container by the day and month it read: a new reading starts from its own chosen day.
export function AgendaCalendarContainer({
    viewModel,
}: {
    readonly viewModel: AgendaCalendarScreen;
}) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    const screen = useAgendaScreen(viewModel);
    const drawer = useCalendarEventDrawer();
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
            {day === undefined ? null : (
                <AgendaDayView
                    day={day}
                    onOpenEvent={drawer.openEdition}
                />
            )}
            <NewCalendarEventButton
                label={t('drawer.newEventOn', {
                    day: presentShortDay(
                        screen.selectedDay,
                        viewModel.calendar.today,
                    ),
                })}
                onClick={() => drawer.openCreation(screen.selectedDay)}
            />
            <CalendarEventDrawerContainer
                target={drawer.target}
                isOpen={drawer.isOpen}
                opening={drawer.opening}
                onClose={drawer.close}
            />
        </>
    );
}
