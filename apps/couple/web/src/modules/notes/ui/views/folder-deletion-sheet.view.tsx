'use client';

import { useTranslation } from 'react-i18next';
import { CommandButton } from '@/shared/ui/command-button';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { presentFolderDeletion } from '../../presenters/folder-deletion.presenter';
import type { FolderListItem } from '../../view-models/note-space-screen.view-model';
import { SheetHeading } from '../components/sheet-heading';

type Props = {
    readonly folder: FolderListItem;
    readonly placeName: string;
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly onConfirm: () => void;
    readonly onKeep: () => void;
};

// R16: the confirmation says where the content of the folder moves up; no note is deleted with it.
export function FolderDeletionSheetView({
    folder,
    placeName,
    isPending,
    isBusy,
    onConfirm,
    onKeep,
}: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    return (
        <>
            <SheetHeading
                title={t('deletion.title', { name: folder.name })}
                description={presentFolderDeletion(folder, placeName, t)}
            />
            <div className="flex flex-col gap-2 px-5 pt-2 pb-6">
                <CommandButton
                    variant="destructive"
                    label={t('deletion.confirm')}
                    pendingLabel={t('deletion.deleting')}
                    isPending={isPending}
                    isBusy={isBusy}
                    onClick={onConfirm}
                />
                <CommandButton
                    variant="outline"
                    label={t('deletion.keep')}
                    pendingLabel={t('deletion.keep')}
                    isPending={false}
                    isBusy={isBusy}
                    onClick={onKeep}
                />
            </div>
        </>
    );
}
