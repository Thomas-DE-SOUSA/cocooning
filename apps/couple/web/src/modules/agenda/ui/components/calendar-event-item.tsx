'use client';

import { Badge, Card } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';
import {
    type AgendaDayItem,
    EventSpanKindEnum,
} from '../../view-models/agenda-screen.view-model';
import { AuthorDot } from './author-dot';
import { CalendarEventTime } from './calendar-event-time';

const SPAN_KEYS = {
    [EventSpanKindEnum.UNTIL]: 'event.until',
    [EventSpanKindEnum.SINCE]: 'event.since',
} as const;

export function CalendarEventItem({ item }: { readonly item: AgendaDayItem }) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    return (
        <li>
            <Card className="flex gap-4">
                <CalendarEventTime
                    startsAt={item.startsAt}
                    endsAt={item.endsAt}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="font-semibold break-words">{item.title}</h3>
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
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <AuthorDot
                            color={item.color}
                            isPrivate={item.isPrivate}
                            className="size-2"
                        />
                        <span>
                            {t(item.isOwner ? 'event.mine' : 'event.partner')}
                        </span>
                        {item.isPrivate ? (
                            <Badge variant="outline">
                                {t('event.private')}
                            </Badge>
                        ) : null}
                    </div>
                </div>
            </Card>
        </li>
    );
}
