'use client';

import { noteSheetGateways } from '../../gateways';
import { useFolderTemplateSheet } from '../../hooks/use-folder-template-sheet';
import type {
    FolderListItem,
    FolderTemplate,
} from '../../view-models/note-space-screen.view-model';
import { NoteSheetCommandEnum } from '../../view-models/note-sheet-command.view-model';
import { FolderTemplateSheetView } from '../views/folder-template-sheet.view';

type Props = {
    readonly folder: FolderListItem;
    readonly template: FolderTemplate;
    readonly onClose: () => void;
};

// « Modifier la fiche » of a smart folder, in place of its actions (R17, R22).
export function FolderTemplateSheetContainer({
    folder,
    template,
    onClose,
}: Props) {
    const sheet = useFolderTemplateSheet({
        gateways: noteSheetGateways,
        folderId: folder.folderId,
        template,
        onClose,
    });
    return (
        <FolderTemplateSheetView
            folderName={folder.name}
            form={sheet.form}
            editor={sheet.editor}
            isPending={
                sheet.pending === NoteSheetCommandEnum.EDIT_FOLDER_TEMPLATE
            }
            isBusy={sheet.isBusy}
            onSubmit={(event) => void sheet.save(event)}
        />
    );
}
