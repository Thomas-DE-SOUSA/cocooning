'use client';

import { Move, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { presentFolderContents } from '../../presenters/place-labels.presenter';
import type { FolderListItem } from '../../view-models/note-space-screen.view-model';
import { SheetAction } from '../components/sheet-action';
import { SheetHeading } from '../components/sheet-heading';

type Props = {
    readonly folder: FolderListItem;
    readonly onRename: () => void;
    readonly onMove: () => void;
    readonly onAskDeletion: () => void;
};

// R14: both partners rename, move and delete a folder they see; the deletion asks once more (R16).
export function FolderActionsSheetView({
    folder,
    onRename,
    onMove,
    onAskDeletion,
}: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    return (
        <>
            <SheetHeading
                title={folder.name}
                description={presentFolderContents(folder, t)}
            />
            <ul className="flex flex-col px-5 pb-6">
                <SheetAction
                    icon={Pencil}
                    label={t('folderSheet.rename')}
                    isDestructive={false}
                    onClick={onRename}
                />
                <SheetAction
                    icon={Move}
                    label={t('folderSheet.move')}
                    isDestructive={false}
                    onClick={onMove}
                />
                <SheetAction
                    icon={Trash2}
                    label={t('folderSheet.delete')}
                    isDestructive
                    onClick={onAskDeletion}
                />
            </ul>
        </>
    );
}
