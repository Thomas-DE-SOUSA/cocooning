import type { FolderNameForm } from '@cocooning/couple-client-business-logic/notes';
import { useState } from 'react';
import type { NoteSheetGateways } from '../gateways/ports/note-sheet.gateways';
import type { FolderListItem } from '../view-models/note-space-screen.view-model';
import {
    type FolderSheetStep,
    FolderSheetStepEnum,
} from '../view-models/note-sheet.view-model';
import { useFolderNameForm } from './use-folder-name-form';
import { useNoteSheetCommands } from './use-note-sheet-commands';
import { useNoteSheetFeedback } from './use-note-sheet-feedback';

type Options = {
    readonly gateways: NoteSheetGateways;
    readonly folder: FolderListItem;
    readonly onClose: () => void;
};

// Composition hook of the sheet of a folder (R14, R16): its actions, then the renaming or the deletion, each in place.
export function useFolderSheet({ gateways, folder, onClose }: Options) {
    const [step, setStep] = useState<FolderSheetStep>(
        FolderSheetStepEnum.ACTIONS,
    );
    const form = useFolderNameForm(folder.name);
    const feedback = useNoteSheetFeedback(onClose);
    const commands = useNoteSheetCommands({ gateways, ...feedback });
    return {
        step,
        form,
        pending: commands.pending,
        isBusy: commands.isBusy,
        showRename: () => setStep(FolderSheetStepEnum.RENAME),
        showEditTemplate: () => setStep(FolderSheetStepEnum.EDIT_TEMPLATE),
        askDeletion: () => setStep(FolderSheetStepEnum.DELETE),
        // An unchanged name closes the sheet without a call.
        rename: (values: FolderNameForm) => {
            if (values.name === folder.name) {
                onClose();
                return;
            }
            commands.renameFolder(folder.folderId, values);
        },
        deleteFolder: () => commands.deleteFolder(folder.folderId),
    };
}
