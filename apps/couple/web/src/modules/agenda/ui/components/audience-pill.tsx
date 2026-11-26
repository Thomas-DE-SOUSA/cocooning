'use client';

import { cn } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';
import {
    type AudiencePill as Pill,
    AudiencePillEnum,
} from '../../view-models/event-tint.view-model';

const PILL_STYLES: Readonly<Record<Pill, string>> = {
    [AudiencePillEnum.BOTH]: 'bg-primary text-primary-foreground',
    [AudiencePillEnum.ME]: 'border border-input bg-background',
    [AudiencePillEnum.YOU]: 'border border-input bg-background',
    [AudiencePillEnum.PRIVATE]:
        'border border-dashed border-input text-muted-foreground',
};

// R11: "Nous deux" filled, "Moi" and "Toi" outlined, "Rien que pour moi" dashed and muted.
export function AudiencePill({ pill }: { readonly pill: Pill }) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    return (
        <span
            data-pill={pill}
            className={cn(
                'inline-flex h-[22px] items-center rounded-full px-2.5 text-xs font-bold',
                PILL_STYLES[pill],
            )}
        >
            {t(`event.audience.${pill}`)}
        </span>
    );
}
