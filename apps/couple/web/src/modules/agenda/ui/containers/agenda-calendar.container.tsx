'use client';

import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';
import { calendarEventCommandGateway } from '../../gateways';
import { useAgendaScreen } from '../../hooks/use-agenda-screen';
import { useCalendarEventDrawer } from '../../hooks/use-calendar-event-drawer';
import { useCalendarEventQuickDeletion } from '../../hooks/use-calendar-event-quick-deletion';
import { presentShortDay } from '../../presenters/day-label.presenter';
import type { AgendaCalendarScreen } from '../../view-models/agenda-screen.view-model';
import { NewCalendarEventButton } from '../components/new-calendar-event-button';
import { AgendaCalendarView } from '../views/agenda-calendar.view';
import { AgendaDayView } from '../views/agenda-day.view';
import { AgendaHeaderView } from '../views/agenda-header.view';
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
    const deletion = useCalendarEventQuickDeletion(calendarEventCommandGateway);
    // Only days the view model holds are ever chosen: the initial one and the tapped ones of the grid.
    const day = viewModel.days[screen.selectedDay];
    return (
        <>
            <AgendaHeaderView onShowToday={screen.showToday} />
            <AgendaCalendarView
                calendar={viewModel.calendar}
                selectedDay={screen.selectedDay}
                onSelectDay={screen.selectDay}
                onChangeMonth={screen.showMonth}
            />
            {day === undefined ? null : (
                <AgendaDayView
                    day={day}
                    removedEventId={deletion.removedEventId}
                    isDeletionBusy={deletion.isBusy}
                    onOpenEvent={drawer.openEdition}
                    onDeleteEvent={(item) =>
                        deletion.deleteCalendarEvent(item.calendarEventId)
                    }
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
