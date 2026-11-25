import 'server-only';
import type {
    GetNoteSpaceContentsUseCase,
    GetNoteUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import {
    type NoteSpace,
    NoteSpaceEnum,
    type NoteVisibility,
} from '@cocooning/couple-shared-kernel/enums';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import type { NoteReading } from '../view-models/note-page.view-model';

// R11: a note has the visibility of its space, so its space is that of its visibility.
const SPACE_OF_VISIBILITY = {
    SHARED: NoteSpaceEnum.SHARED,
    PRIVATE: NoteSpaceEnum.PRIVATE,
} as const satisfies Record<NoteVisibility, NoteSpace>;

type UseCases = {
    readonly getNote: GetNoteUseCase;
    readonly getNoteSpaceContents: GetNoteSpaceContentsUseCase;
};

// The note, then the place it is in: its way back and the first level of the move picker.
export async function readNoteWithPlace(
    noteId: string,
    { getNote, getNoteSpaceContents }: UseCases,
): Promise<Result<NoteReading, ApiError>> {
    const note = await getNote.execute(noteId);
    if (!note.success) return note;
    const place = await getNoteSpaceContents.execute(
        SPACE_OF_VISIBILITY[note.value.visibility],
        note.value.folderId,
    );
    return place.success ? ok({ note: note.value, place: place.value }) : place;
}
