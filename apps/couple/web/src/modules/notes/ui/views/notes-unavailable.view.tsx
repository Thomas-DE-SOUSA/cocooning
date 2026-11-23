'use client';

import { Button } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { NOTES_NAMESPACE } from '../../data/notes-i18n-namespaces';

type Props = {
    readonly description: string;
    readonly onRefresh: () => void;
};

export function NotesUnavailableView({ description, onRefresh }: Props) {
    const { t } = useTranslation(NOTES_NAMESPACE);
    return (
        <section
            role="alert"
            className="flex w-full flex-col gap-4 text-center"
        >
            <p className="font-medium">{t('unavailable.title')}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            <Button
                variant="secondary"
                onClick={onRefresh}
            >
                {t('unavailable.refresh')}
            </Button>
        </section>
    );
}
