'use client';

import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';

type Props = {
    readonly startsAt: string | null;
    readonly endsAt: string | null;
};

// "Toute la journée", or the start hour above the end hour (HH:MM of Paris, decision 0047).
export function CalendarEventTime({ startsAt, endsAt }: Props) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    return (
        <p className="flex w-16 shrink-0 flex-col text-sm font-semibold tabular-nums">
            {startsAt === null ? (
                <span>{t('day.allDay')}</span>
            ) : (
                <>
                    <span>{startsAt}</span>
                    {endsAt === null ? null : (
                        <span className="text-muted-foreground">{endsAt}</span>
                    )}
                </>
            )}
        </p>
    );
}
