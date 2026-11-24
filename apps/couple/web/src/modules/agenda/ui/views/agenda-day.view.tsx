'use client';

import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';
import type {
    AgendaDayItem,
    AgendaDayViewModel,
} from '../../view-models/agenda-screen.view-model';
import { CalendarEventItem } from '../components/calendar-event-item';

type Props = {
    readonly day: AgendaDayViewModel;
    readonly removedEventId: string | null;
    readonly isDeletionBusy: boolean;
    readonly onOpenEvent: (item: AgendaDayItem) => void;
    readonly onDeleteEvent: (item: AgendaDayItem) => void;
};

// The events of the chosen day, under the grid; the bottom padding keeps the last one clear of the floating button.
export function AgendaDayView({
    day,
    removedEventId,
    isDeletionBusy,
    onOpenEvent,
    onDeleteEvent,
}: Props) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    return (
        <section className="flex flex-col gap-3 pb-16">
            <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-xl font-semibold">{day.label}</h2>
                {day.isToday ? (
                    <span className="text-sm text-muted-foreground">
                        {t('today')}
                    </span>
                ) : null}
            </div>
            {day.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {t('day.empty')}
                </p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {day.items.map((item) => (
                        <CalendarEventItem
                            key={item.calendarEventId}
                            item={item}
                            isRemoved={item.calendarEventId === removedEventId}
                            isBusy={isDeletionBusy}
                            onOpen={() => onOpenEvent(item)}
                            onDelete={() => onDeleteEvent(item)}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}
