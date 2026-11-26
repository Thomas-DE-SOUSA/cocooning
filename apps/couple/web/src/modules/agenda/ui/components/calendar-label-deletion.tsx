'use client';

import { Button } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { CommandButton } from '@/shared/ui/command-button';
import { CALENDAR_LABELS_NAMESPACE } from '../../data/calendar-labels-i18n-namespace';

type Props = {
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly isDeletionAsked: boolean;
    readonly onAskDeletion: () => void;
    readonly onConfirmDeletion: () => void;
    readonly onKeep: () => void;
};

// R14: the confirmation says that the events of the label stay, without a label.
export function CalendarLabelDeletion(props: Props) {
    const { t } = useTranslation(CALENDAR_LABELS_NAMESPACE);
    if (!props.isDeletionAsked) {
        return (
            <Button
                variant="ghost"
                className="self-start text-destructive"
                disabled={props.isBusy}
                onClick={props.onAskDeletion}
            >
                {t('deletion.ask')}
            </Button>
        );
    }
    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
                {t('deletion.description')}
            </p>
            <div className="flex flex-wrap gap-2">
                <CommandButton
                    variant="destructive"
                    label={t('deletion.confirm')}
                    pendingLabel={t('deletion.deleting')}
                    isPending={props.isPending}
                    isBusy={props.isBusy}
                    onClick={props.onConfirmDeletion}
                />
                <CommandButton
                    variant="ghost"
                    label={t('deletion.keep')}
                    pendingLabel={t('deletion.keep')}
                    isPending={false}
                    isBusy={props.isBusy}
                    onClick={props.onKeep}
                />
            </div>
        </div>
    );
}
