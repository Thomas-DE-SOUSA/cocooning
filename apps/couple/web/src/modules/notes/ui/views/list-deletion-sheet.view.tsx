'use client';

import { useTranslation } from 'react-i18next';
import { CommandButton } from '@/shared/ui/command-button';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';
import { SheetHeading } from '../components/sheet-heading';

type Props = {
    readonly title: string;
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly onConfirm: () => void;
    readonly onKeep: () => void;
};

// R7, R26: the list goes with all its lines, so its owner is asked once more.
export function ListDeletionSheetView({
    title,
    isPending,
    isBusy,
    onConfirm,
    onKeep,
}: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    return (
        <>
            <SheetHeading
                title={t('listDeletion.title', { title })}
                description={t('listDeletion.description')}
            />
            <div className="flex flex-col gap-2 px-5 pt-2 pb-6">
                <CommandButton
                    variant="destructive"
                    label={t('listDeletion.confirm')}
                    pendingLabel={t('listDeletion.deleting')}
                    isPending={isPending}
                    isBusy={isBusy}
                    onClick={onConfirm}
                />
                <CommandButton
                    variant="outline"
                    label={t('listDeletion.keep')}
                    pendingLabel={t('listDeletion.keep')}
                    isPending={false}
                    isBusy={isBusy}
                    onClick={onKeep}
                />
            </div>
        </>
    );
}
