'use client';

import { Button, Spinner } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { PAIRING_NAMESPACE } from '../../data/pairing-i18n-namespaces';

type Props = {
    readonly isPending: boolean;
    readonly onCreateCouple: () => void;
};

export function NoCoupleView({ isPending, onCreateCouple }: Props) {
    const { t } = useTranslation(PAIRING_NAMESPACE);
    return (
        <section className="flex w-full max-w-sm flex-col gap-4 text-center">
            <p className="text-sm text-muted-foreground">
                {t('noCouple.intro')}
            </p>
            <Button
                onClick={onCreateCouple}
                disabled={isPending}
                aria-busy={isPending}
            >
                {isPending ? (
                    <Spinner aria-label={t('noCouple.creating')} />
                ) : (
                    t('noCouple.create')
                )}
            </Button>
        </section>
    );
}
