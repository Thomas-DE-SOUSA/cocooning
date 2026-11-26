'use client';

import { Card, cn, SwipeToDelete } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';
import {
    type AgendaDayItem,
    EventSpanKindEnum,
} from '../../view-models/agenda-screen.view-model';
import { CalendarEventTime } from './calendar-event-time';
import { EventLabelLine } from './event-label-line';
import { TINT_FILL } from './event-tint-classes';

const SPAN_KEYS = {
    [EventSpanKindEnum.UNTIL]: 'event.until',
    [EventSpanKindEnum.SINCE]: 'event.since',
} as const;

type Props = {
    readonly item: AgendaDayItem;
    readonly isRemoved: boolean;
    readonly isBusy: boolean;
    readonly onOpen: () => void;
    readonly onDelete: () => void;
};

// The title is a button stretched over the whole card: a tap anywhere opens the drawer, the heading stays a heading.
// R13: a bar of 5 px on the left in the colour of its label; the card clips it, so the focus ring is drawn inside.
// R9: a swipe to the left deletes the event for both partners (the drawer keeps its own deletion).
export function CalendarEventItem({
    item,
    isRemoved,
    isBusy,
    onOpen,
    onDelete,
}: Props) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    return (
        <li>
            <SwipeToDelete
                label={t('event.swipeDelete')}
                onDelete={onDelete}
                isRemoved={isRemoved}
                disabled={isBusy}
            >
                <Card className="relative flex gap-4 overflow-hidden pl-6">
                    <span
                        aria-hidden="true"
                        data-tint={item.tint}
                        className={cn(
                            'absolute inset-y-0 left-0 w-[5px]',
                            TINT_FILL[item.tint],
                        )}
                    />
                    <CalendarEventTime
                        startsAt={item.startsAt}
                        endsAt={item.endsAt}
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <h3 className="font-semibold break-words">
                            <button
                                type="button"
                                onClick={onOpen}
                                className="text-left after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
                            >
                                {item.title}
                            </button>
                        </h3>
                        {item.description === null ? null : (
                            <p className="line-clamp-2 text-sm whitespace-pre-line text-muted-foreground">
                                {item.description}
                            </p>
                        )}
                        {item.span === null ? null : (
                            <p className="text-sm text-muted-foreground">
                                {t(SPAN_KEYS[item.span.kind], {
                                    day: item.span.day,
                                })}
                            </p>
                        )}
                        <EventLabelLine item={item} />
                    </div>
                </Card>
            </SwipeToDelete>
        </li>
    );
}
