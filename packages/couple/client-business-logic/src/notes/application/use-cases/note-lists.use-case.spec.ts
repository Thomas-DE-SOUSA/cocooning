import { NoteListKindEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { ApiErrorCodeEnum } from '../../../shared/api-error';
import { FakeNoteListsGateway } from '../../../testing/fake-note-lists.gateway';
import {
    A_GROCERY_LIST,
    A_NOTE_LIST_INDEX,
} from '../../../testing/note-lists-fixtures';
import { CreateNoteListUseCase } from './create-note-list.use-case';
import { EditNoteListUseCase } from './edit-note-list.use-case';
import { ListNoteListsUseCase } from './list-note-lists.use-case';

const LIST_ID = A_GROCERY_LIST.noteId;
const CHRISTMAS = {
    kind: NoteListKindEnum.TASKS,
    space: 'PRIVATE',
    title: 'Noël',
    emoji: '🎄',
} as const;
const NOT_A_LIST = {
    code: ApiErrorCodeEnum.NOT_FOUND,
    message: 'Note list not found',
    backendCode: 'NOTE_LIST_NOT_FOUND',
};

describe('Feature: the lists of the Lists tab from the PWA', () => {
    let gateway: FakeNoteListsGateway;

    beforeEach(() => {
        gateway = new FakeNoteListsGateway();
    });

    it('lists the lists of one section (R28)', async () => {
        await expect(
            new ListNoteListsUseCase(gateway).execute(
                NoteListKindEnum.GROCERIES,
            ),
        ).resolves.toEqual(ok(A_NOTE_LIST_INDEX));
        expect(gateway.calls).toEqual([
            { operation: 'listOf', kind: NoteListKindEnum.GROCERIES },
        ]);
    });

    it('creates a private task list with its emoji (R26)', async () => {
        await expect(
            new CreateNoteListUseCase(gateway).execute(CHRISTMAS),
        ).resolves.toEqual(
            ok({
                ...A_GROCERY_LIST,
                title: 'Noël',
                emoji: '🎄',
                visibility: 'PRIVATE',
                openItemCount: 0,
            }),
        );
        expect(gateway.calls).toEqual([
            { operation: 'create', request: CHRISTMAS },
        ]);
    });

    it('changes the title and removes the emoji together (R26)', async () => {
        const details = { title: 'Lidl', emoji: null };
        await expect(
            new EditNoteListUseCase(gateway).execute(LIST_ID, details),
        ).resolves.toEqual(ok({ ...A_GROCERY_LIST, ...details }));
        expect(gateway.calls).toEqual([
            { operation: 'edit', noteId: LIST_ID, request: details },
        ]);
    });

    it('returns a note that is no list, refused by the API, unchanged (R26)', async () => {
        gateway.givenRefusal(NOT_A_LIST);
        await expect(
            new EditNoteListUseCase(gateway).execute(LIST_ID, {
                title: 'Lidl',
                emoji: null,
            }),
        ).resolves.toEqual(fail(NOT_A_LIST));
    });
});
