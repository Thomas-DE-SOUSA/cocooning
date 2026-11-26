import {
    GetNoteSpaceContentsUseCase,
    GetNoteUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_SHARED_NOTE,
    A_SPACE_CONTENTS,
    FakeNoteFoldersGateway,
    FakeNotesGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { readNoteWithPlace } from './note-with-place.service';

describe('Feature: the page of a note reads the note and its place', () => {
    let notes: FakeNotesGateway;
    let folders: FakeNoteFoldersGateway;

    beforeEach(() => {
        notes = new FakeNotesGateway();
        folders = new FakeNoteFoldersGateway();
    });

    const read = () =>
        readNoteWithPlace(A_SHARED_NOTE.noteId, {
            getNote: new GetNoteUseCase(notes),
            getNoteSpaceContents: new GetNoteSpaceContentsUseCase(folders),
        });

    it('R11, reads the place of a shared note in « Partagé »', async () => {
        expect(await read()).toEqual(
            ok({
                note: {
                    ...A_SHARED_NOTE,
                    card: null,
                    listKind: null,
                    emoji: null,
                },
                place: A_SPACE_CONTENTS,
            }),
        );
        expect(folders.calls).toEqual([
            {
                operation: 'getSpaceContents',
                space: NoteSpaceEnum.SHARED,
                folderId: null,
            },
        ]);
    });

    it('reads nothing more when the note is refused', async () => {
        const refusal: ApiError = {
            code: ApiErrorCodeEnum.NOT_FOUND,
            message: 'Note not found',
            backendCode: 'NOTE_NOT_FOUND',
        };
        notes.givenRefusal(refusal);

        expect(await read()).toEqual(fail(refusal));
        expect(folders.calls).toEqual([]);
    });

    it('passes the refusal of the place through', async () => {
        const refusal: ApiError = {
            code: ApiErrorCodeEnum.NOT_FOUND,
            message: 'Folder not found',
            backendCode: 'FOLDER_NOT_FOUND',
        };
        folders.givenRefusal(refusal);

        expect(await read()).toEqual(fail(refusal));
    });
});
