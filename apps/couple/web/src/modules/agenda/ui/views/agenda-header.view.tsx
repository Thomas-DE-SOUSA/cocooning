'use client';

import { Button } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';

type Props = {
    readonly onShowToday: (() => void) | null;
};

// The title of the tab, and "Aujourd'hui" when a grid is shown to bring it back to today.
export function AgendaHeaderView({ onShowToday }: Props) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    return (
        <header className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold">{t('title')}</h1>
            {onShowToday === null ? null : (
                <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={onShowToday}
                >
                    {t('today')}
                </Button>
            )}
        </header>
    );
}
