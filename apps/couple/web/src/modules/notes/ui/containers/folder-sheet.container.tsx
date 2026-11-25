'use client';

import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { noteSheetGateways } from '../../gateways';
import { useFolderSheet } from '../../hooks/use-folder-sheet';
import { presentPlaceName } from '../../presenters/place-labels.presenter';
import type { NotePlace } from '../../view-models/note-place.view-model';
import type { FolderListItem } from '../../view-models/note-space-screen.view-model';
import { NoteSheetCommandEnum } from '../../view-models/note-sheet-command.view-model';
import { FolderSheetStepEnum } from '../../view-models/note-sheet.view-model';
import { FolderActionsSheetView } from '../views/folder-actions-sheet.view';
import { FolderDeletionSheetView } from '../views/folder-deletion-sheet.view';
import { FolderNameSheetView } from '../views/folder-name-sheet.view';

type Props = {
    readonly folder: FolderListItem;
    readonly place: NotePlace;
    readonly onClose: () => void;
};

// The sheet of a folder of the screen; place is where the folder is, where its content moves up (R16).
export function FolderSheetContainer({ folder, place, onClose }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const sheet = useFolderSheet({
        gateways: noteSheetGateways,
        folder,
        onClose,
    });
    if (sheet.step === FolderSheetStepEnum.RENAME) {
        return (
            <FolderNameSheetView
                form={sheet.form}
                labels={{
                    title: t('renameFolder.title', { name: folder.name }),
                    description: t('renameFolder.description'),
                    submit: t('renameFolder.submit'),
                    pending: t('renameFolder.renaming'),
                }}
                isPending={sheet.pending === NoteSheetCommandEnum.RENAME_FOLDER}
                isBusy={sheet.isBusy}
                onSubmit={sheet.rename}
            />
        );
    }
    if (sheet.step === FolderSheetStepEnum.DELETE) {
        return (
            <FolderDeletionSheetView
                folder={folder}
                placeName={presentPlaceName(place, t)}
                isPending={sheet.pending === NoteSheetCommandEnum.DELETE_FOLDER}
                isBusy={sheet.isBusy}
                onConfirm={sheet.deleteFolder}
                onKeep={onClose}
            />
        );
    }
    return (
        <FolderActionsSheetView
            folder={folder}
            onRename={sheet.showRename}
            onAskDeletion={sheet.askDeletion}
        />
    );
}
