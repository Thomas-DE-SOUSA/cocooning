'use client';

import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CALENDAR_LABELS_NAMESPACE } from '../../data/calendar-labels-i18n-namespace';
import type { CalendarLabelItem } from '../../view-models/calendar-label.view-model';
import { EventDot } from '../components/event-dot';

type Props = {
    readonly labels: readonly CalendarLabelItem[];
    readonly onOpenLabel: (label: CalendarLabelItem) => void;
};

// R12: the labels of the couple; a tap opens one to rename, recolour or delete it (R14).
export function CalendarLabelsCardView({ labels, onOpenLabel }: Props) {
    const { t } = useTranslation(CALENDAR_LABELS_NAMESPACE);
    if (labels.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">{t('card.empty')}</p>
        );
    }
    return (
        <>
            <p className="text-sm text-muted-foreground">{t('card.hint')}</p>
            <ul className="-mx-2 flex flex-col">
                {labels.map((label) => (
                    <li key={label.calendarLabelId}>
                        <button
                            type="button"
                            aria-label={t('card.edit', { name: label.name })}
                            onClick={() => onOpenLabel(label)}
                            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                        >
                            <EventDot
                                tint={label.color}
                                isPrivate={false}
                                className="size-3"
                            />
                            <span className="flex-1 break-words">
                                {label.name}
                            </span>
                            <ChevronRight
                                aria-hidden
                                className="size-4 text-muted-foreground"
                            />
                        </button>
                    </li>
                ))}
            </ul>
        </>
    );
}
