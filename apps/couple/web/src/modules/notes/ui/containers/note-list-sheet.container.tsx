'use client';

import { Drawer, DrawerContent } from '@cocooning/design-system';
import { noteListCommandGateway } from '../../gateways';
import { useListDetailsForm } from '../../hooks/use-list-details-form';
import { useNoteListCommands } from '../../hooks/use-note-list-commands';
import { useNoteListFeedback } from '../../hooks/use-note-list-feedback';
import { NoteListCommandEnum } from '../../view-models/note-list-command.view-model';
import type { NoteListViewModel } from '../../view-models/note-list-page.view-model';
import {
    type NoteListSheetStep,
    NoteListSheetStepEnum,
} from '../../view-models/note-list-sheet.view-model';
import { ListActionsSheetView } from '../views/list-actions-sheet.view';
import { ListDeletionSheetView } from '../views/list-deletion-sheet.view';
import { ListDetailsSheetView } from '../views/list-details-sheet.view';

type Props = {
    readonly list: NoteListViewModel;
    readonly isOpen: boolean;
    readonly step: NoteListSheetStep;
    readonly opening: number;
    readonly onGoTo: (step: NoteListSheetStep) => void;
    readonly onClose: () => void;
};

// The « ⋯ » of a list (decision 0053): a deleted list leaves for its section, a changed one is read again.
export function NoteListSheetContainer({
    isOpen,
    opening,
    onClose,
    ...content
}: Props) {
    return (
        <Drawer
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DrawerContent>
                <NoteListSheetContent
                    key={opening}
                    onClose={onClose}
                    {...content}
                />
            </DrawerContent>
        </Drawer>
    );
}

function NoteListSheetContent({
    list,
    step,
    onGoTo,
    onClose,
}: Omit<Props, 'isOpen' | 'opening'>) {
    const form = useListDetailsForm(list.title, list.emoji);
    const commands = useNoteListCommands({
        gateway: noteListCommandGateway,
        ...useNoteListFeedback(onClose, list.backHref),
    });
    if (step === NoteListSheetStepEnum.DETAILS) {
        return (
            <ListDetailsSheetView
                form={form}
                isPending={commands.pending === NoteListCommandEnum.EDIT_LIST}
                isBusy={commands.isBusy}
                onSave={(values) => commands.editList(list.noteId, values)}
            />
        );
    }
    if (step === NoteListSheetStepEnum.DELETION) {
        return (
            <ListDeletionSheetView
                title={list.title}
                isPending={commands.pending === NoteListCommandEnum.DELETE_LIST}
                isBusy={commands.isBusy}
                onConfirm={() => commands.deleteList(list.noteId)}
                onKeep={onClose}
            />
        );
    }
    return (
        <ListActionsSheetView
            list={list}
            onEditDetails={() => onGoTo(NoteListSheetStepEnum.DETAILS)}
            onAskDeletion={() => onGoTo(NoteListSheetStepEnum.DELETION)}
        />
    );
}
