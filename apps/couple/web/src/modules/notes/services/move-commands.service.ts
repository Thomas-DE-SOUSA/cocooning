import 'server-only';
import type {
    MoveFolderUseCase,
    MoveNoteUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { MoveFolderRequestSchema } from '@cocooning/couple-contract/notes';
import { fail, type Result } from '@cocooning/shared-kernel/utils';
import { actOnFolder } from './folder-commands.service';
import { actOnNote, invalid } from './note-commands.service';
import { NoteLocationSchema } from './note-location.zod';

// R11: a note goes to a folder or a space root and takes the visibility of its space; the API refuses the other's
// note in « Privé » (NOTE_RESERVED_TO_OWNER). The id and the place are validated again (core-frontend.md rule 14).
export function moveNote(
    noteIdInput: unknown,
    destinationInput: unknown,
    useCase: MoveNoteUseCase,
): Promise<Result<null, ApiError>> {
    const destination = NoteLocationSchema.safeParse(destinationInput);
    if (!destination.success) {
        return Promise.resolve(fail(invalid('Invalid note place')));
    }
    return actOnNote(noteIdInput, (noteId) =>
        useCase.execute(noteId, destination.data),
    );
}

// R15: a folder moves within its own space; the API refuses another space or one of its sub-folders (FOLDER_MOVE_INVALID).
export function moveFolder(
    folderIdInput: unknown,
    parentInput: unknown,
    useCase: MoveFolderUseCase,
): Promise<Result<null, ApiError>> {
    const request = MoveFolderRequestSchema.safeParse({
        parentFolderId: parentInput,
    });
    if (!request.success) {
        return Promise.resolve(fail(invalid('Invalid parent folder')));
    }
    return actOnFolder(folderIdInput, (folderId) =>
        useCase.execute(folderId, request.data.parentFolderId),
    );
}
