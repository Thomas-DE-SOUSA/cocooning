'use client';

import { Card } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { PAIRING_NAMESPACE } from '../../data/pairing-i18n-namespaces';
import { CommandButton } from '@/shared/ui/command-button';

type Props = {
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly onCreateCouple: () => void;
};

export function NoCoupleView({ isPending, isBusy, onCreateCouple }: Props) {
    const { t } = useTranslation(PAIRING_NAMESPACE);
    return (
        <Card className="flex w-full max-w-sm flex-col gap-4 p-5 text-center">
            <p className="text-sm text-muted-foreground">
                {t('noCouple.intro')}
            </p>
            <CommandButton
                variant="primary"
                label={t('noCouple.create')}
                pendingLabel={t('noCouple.creating')}
                isPending={isPending}
                isBusy={isBusy}
                onClick={onCreateCouple}
            />
        </Card>
    );
}
