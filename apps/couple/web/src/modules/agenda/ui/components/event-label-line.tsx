'use client';

import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';
import type { AgendaDayItem } from '../../view-models/agenda-screen.view-model';
import { AudiencePill } from './audience-pill';
import { EventDot } from './event-dot';

// Under the title: who the event is for (R11), then its label, or "Sans étiquette" in neutral (R13).
export function EventLabelLine({ item }: { readonly item: AgendaDayItem }) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <AudiencePill pill={item.pill} />
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <EventDot
                    tint={item.tint}
                    isPrivate={false}
                    className="size-2"
                />
                {item.labelName ?? t('event.noLabel')}
            </span>
        </div>
    );
}
