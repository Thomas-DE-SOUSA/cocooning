'use client';

import { Button } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { CommandButton } from '@/shared/ui/command-button';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';

type Props = {
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly isDeletionAsked: boolean;
    readonly onAskDeletion: () => void;
    readonly onConfirmDeletion: () => void;
    readonly onKeep: () => void;
};

// R9: either partner deletes a shared event; it asks once more, since the event disappears for both.
export function CalendarEventDeletion(props: Props) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    if (!props.isDeletionAsked) {
        return (
            <Button
                variant="ghost"
                className="self-start text-destructive"
                disabled={props.isBusy}
                onClick={props.onAskDeletion}
            >
                {t('drawer.delete')}
            </Button>
        );
    }
    return (
        <div className="flex flex-wrap gap-2">
            <CommandButton
                variant="destructive"
                label={t('drawer.confirmDelete')}
                pendingLabel={t('drawer.deleting')}
                isPending={props.isPending}
                isBusy={props.isBusy}
                onClick={props.onConfirmDeletion}
            />
            <CommandButton
                variant="ghost"
                label={t('drawer.keep')}
                pendingLabel={t('drawer.keep')}
                isPending={false}
                isBusy={props.isBusy}
                onClick={props.onKeep}
            />
        </div>
    );
}
