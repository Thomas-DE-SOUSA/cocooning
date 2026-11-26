import {
    type NoteListKind,
    NoteListKindEnum,
    NoteSpaceEnum,
    NoteVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    MILLISECONDS_PER_HOUR,
    NOW,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

const LATER = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: the home of a section of the Lists tab (R28)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const list = (
        context: typeof AS_A,
        kind: NoteListKind = NoteListKindEnum.GROCERIES,
    ) => ctx.listNoteListsUseCase().execute(context, { kind });

    describe('Scenario: R4, R28, the lists one partner sees in « Courses »', () => {
        it('gives the shared lists and her own private ones, the most recently changed first', async () => {
            const carrefour = ctx.givenListOf(AS_A, 'Carrefour');
            ctx.advanceHours(1);
            const marche = ctx.givenListOf(
                AS_B,
                'Marché',
                NoteListKindEnum.GROCERIES,
                NoteSpaceEnum.PRIVATE,
                null,
            );
            ctx.givenListOf(
                AS_A,
                'Pharmacie',
                NoteListKindEnum.GROCERIES,
                NoteSpaceEnum.PRIVATE,
            );
            await expect(list(AS_B)).resolves.toEqual([
                {
                    noteId: marche.id.getValue(),
                    title: 'Marché',
                    emoji: null,
                    visibility: NoteVisibilityEnum.PRIVATE,
                    isOwner: true,
                    openItemCount: 0,
                    updatedAt: LATER,
                },
                {
                    noteId: carrefour.id.getValue(),
                    title: 'Carrefour',
                    emoji: '🛒',
                    visibility: NoteVisibilityEnum.SHARED,
                    isOwner: false,
                    openItemCount: 0,
                    updatedAt: NOW,
                },
            ]);
        });

        it('leaves out the other section and the ordinary notes', async () => {
            ctx.givenListOf(AS_A, 'Noël', NoteListKindEnum.TASKS);
            ctx.givenNoteOf(AS_A, 'Courses');
            await expect(list(AS_A)).resolves.toEqual([]);
            await expect(
                list(AS_A, NoteListKindEnum.TASKS),
            ).resolves.toMatchObject([{ title: 'Noël' }]);
        });
    });

    describe('Scenario: R28, what is left to check', () => {
        it('gives the count of the last saved document', async () => {
            const carrefour = ctx.givenListOf(AS_A);
            ctx.noteChecklistReader.willCount(3);
            await ctx.saveNoteDocumentUseCase().execute(AS_B, {
                noteId: carrefour.id.getValue(),
                content: Uint8Array.from([1]),
            });
            await expect(list(AS_A)).resolves.toMatchObject([
                { openItemCount: 3 },
            ]);
        });
    });

    describe('Scenario: another couple', () => {
        it('sees none of the lists of the couple', async () => {
            ctx.givenListOf(AS_A);
            await expect(list(AS_STRANGER)).resolves.toEqual([]);
        });
    });
});
