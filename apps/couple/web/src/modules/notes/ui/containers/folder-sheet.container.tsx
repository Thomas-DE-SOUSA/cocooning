'use client';

import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { noteSheetGateways } from '../../gateways';
import { useFolderSheet } from '../../hooks/use-folder-sheet';
import { presentMovedFolder } from '../../presenters/moved-item.presenter';
import { presentPlaceName } from '../../presenters/place-labels.presenter';
import type {
    FolderListItem,
    NotePlaceLevel,
} from '../../view-models/note-space-screen.view-model';
import { NoteSheetCommandEnum } from '../../view-models/note-sheet-command.view-model';
import {
    FolderSheetStepEnum,
    NoteSheetKindEnum,
    type NoteSheetTarget,
} from '../../view-models/note-sheet.view-model';
import { FolderActionsSheetView } from '../views/folder-actions-sheet.view';
import { FolderDeletionSheetView } from '../views/folder-deletion-sheet.view';
import { FolderNameSheetView } from '../views/folder-name-sheet.view';
import { FolderTemplateSheetContainer } from './folder-template-sheet.container';

type Props = {
    readonly folder: FolderListItem;
    readonly level: NotePlaceLevel;
    readonly onClose: () => void;
    readonly onOpen: (target: NoteSheetTarget) => void;
};

// The sheet of a folder of a level: its content moves up into the place of that level (R16); « Déplacer » turns it into
// the move picker, starting from that level.
export function FolderSheetContainer({
    folder,
    level,
    onClose,
    onOpen,
}: Props) {
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
    if (
        sheet.step === FolderSheetStepEnum.EDIT_TEMPLATE &&
        folder.template !== null
    ) {
        return (
            <FolderTemplateSheetContainer
                folder={folder}
                template={folder.template}
                onClose={onClose}
            />
        );
    }
    if (sheet.step === FolderSheetStepEnum.DELETE) {
        return (
            <FolderDeletionSheetView
                folder={folder}
                placeName={presentPlaceName(level.place, t)}
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
            onEditTemplate={
                folder.template === null ? null : sheet.showEditTemplate
            }
            onMove={() =>
                onOpen({
                    kind: NoteSheetKindEnum.MOVE,
                    item: presentMovedFolder(folder, level.place),
                    level,
                })
            }
            onAskDeletion={sheet.askDeletion}
        />
    );
}
