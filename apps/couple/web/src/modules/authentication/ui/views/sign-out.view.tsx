'use client';

import { Button, Spinner } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { SIGN_OUT_NAMESPACE } from '../../data/authentication-i18n-namespaces';

type Props = {
    readonly isPending: boolean;
    readonly onSignOut: () => void;
};

export function SignOutView({ isPending, onSignOut }: Props) {
    const { t } = useTranslation(SIGN_OUT_NAMESPACE);
    return (
        <Button
            variant="outline"
            onClick={onSignOut}
            disabled={isPending}
            aria-busy={isPending}
        >
            {isPending ? (
                <Spinner aria-label={t('signOut.pending')} />
            ) : (
                t('signOut.label')
            )}
        </Button>
    );
}
