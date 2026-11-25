'use client';

import { useTranslation } from 'react-i18next';
import { CommandButton } from '@/shared/ui/command-button';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { SheetHeading } from '../components/sheet-heading';

type Props = {
    readonly title: string;
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly onConfirm: () => void;
    readonly onKeep: () => void;
};

// R7: the note goes for both partners, so its owner is asked once more.
export function NoteDeletionSheetView({
    title,
    isPending,
    isBusy,
    onConfirm,
    onKeep,
}: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    return (
        <>
            <SheetHeading
                title={t('noteDeletion.title', { title })}
                description={t('noteDeletion.description')}
            />
            <div className="flex flex-col gap-2 px-5 pt-2 pb-6">
                <CommandButton
                    variant="destructive"
                    label={t('noteDeletion.confirm')}
                    pendingLabel={t('noteDeletion.deleting')}
                    isPending={isPending}
                    isBusy={isBusy}
                    onClick={onConfirm}
                />
                <CommandButton
                    variant="outline"
                    label={t('noteDeletion.keep')}
                    pendingLabel={t('noteDeletion.keep')}
                    isPending={false}
                    isBusy={isBusy}
                    onClick={onKeep}
                />
            </div>
        </>
    );
}
