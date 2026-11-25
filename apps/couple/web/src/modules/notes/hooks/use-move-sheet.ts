import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { useCallback } from 'react';
import type { NoteSheetGateways } from '../gateways/ports/note-sheet.gateways';
import type { NoteSpaceContentsGateway } from '../gateways/ports/note-space-contents.gateway';
import { presentLocation } from '../presenters/note-place.presenter';
import {
    type MovedItem,
    MovedItemKindEnum,
} from '../view-models/moved-item.view-model';
import type { NotePlaceLevel } from '../view-models/note-space-screen.view-model';
import { NoteSheetCommandEnum } from '../view-models/note-sheet-command.view-model';
import { useMovePicker } from './use-move-picker';
import { useNoteSheetCommands } from './use-note-sheet-commands';
import { useNoteSheetFeedback } from './use-note-sheet-feedback';

type Options = {
    readonly gateways: NoteSheetGateways;
    readonly contents: NoteSpaceContentsGateway;
    readonly item: MovedItem;
    readonly start: NotePlaceLevel;
    readonly onClose: () => void;
};

// Composition hook of the move picker: walk the places, then move the note or the folder to the one shown (R11, R15).
// The API stays the judge: FOLDER_MOVE_INVALID, FOLDER_SPACE_MISMATCH, NOTE_RESERVED_TO_OWNER.
export function useMoveSheet({
    gateways,
    contents,
    item,
    start,
    onClose,
}: Options) {
    const { onDone, onFailed } = useNoteSheetFeedback(onClose);
    const commands = useNoteSheetCommands({ gateways, onDone, onFailed });
    const command =
        item.kind === MovedItemKindEnum.NOTE
            ? NoteSheetCommandEnum.MOVE_NOTE
            : NoteSheetCommandEnum.MOVE_FOLDER;
    const onReadFailed = useCallback(
        (error: ApiError) => onFailed(command, error),
        [onFailed, command],
    );
    const picker = useMovePicker({
        gateway: contents,
        start,
        onFailed: onReadFailed,
    });
    const moveHere = () => {
        const destination = presentLocation(picker.level.place);
        if (item.kind === MovedItemKindEnum.NOTE) {
            commands.moveNote(item.id, destination);
            return;
        }
        commands.moveFolder(item.id, destination.folderId);
    };
    return {
        ...picker,
        isMoving: commands.pending !== null,
        isBusy: commands.isBusy,
        moveHere,
    };
}
