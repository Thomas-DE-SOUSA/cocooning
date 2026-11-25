import {
    NoteCardStatusEnum,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    NOW,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';
import { PROPOSED_TEMPLATE } from '../../__tests__/secondary/adapters/fake-note-card.writer';

const SOURCE = 'https://www.example.org/chez-paul';

describe('Feature: the cards on the screens of the notes (R18, R20, R21)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    describe('Scenario: R20, R21, a partner opens a note with its card', () => {
        it('gives the values, « non trouvé » as null, the sources and the date', async () => {
            const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
            const note = ctx.givenNoteOf(AS_A, 'Chez Paul', restaurants);
            const card = ctx.givenFilledCardOf(
                note,
                { Adresse: '11 rue Mercière', Cuisine: 'Lyonnaise' },
                [SOURCE],
            );
            const view = await ctx
                .getNoteUseCase()
                .execute(AS_B, { noteId: note.id.getValue() });
            expect(view.card).toEqual({
                noteCardId: card.id.getValue(),
                noteId: note.id.getValue(),
                status: NoteCardStatusEnum.FILLED,
                query: 'Chez Paul',
                fields: [
                    {
                        name: 'Adresse',
                        value: '11 rue Mercière',
                        isManual: false,
                    },
                    { name: 'Cuisine', value: 'Lyonnaise', isManual: false },
                    { name: 'Prix', value: null, isManual: false },
                ],
                candidates: [],
                sources: [SOURCE],
                searchedAt: NOW,
                updatedAt: NOW,
            });
        });
    });

    describe('Scenario: R18, R20, a partner opens « Lyon » inside « Restaurants »', () => {
        it('gives the template it reads and the card of each note', async () => {
            const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
            const lyon = ctx.givenSmartFolderOf(AS_A, 'Lyon', restaurants);
            const withCard = ctx.givenNoteOf(AS_A, 'Chez Paul', lyon);
            ctx.givenNoteOf(AS_B, 'À trier', lyon);
            const card = ctx.givenCardOf(withCard);
            const contents = await ctx
                .getNoteSpaceContentsUseCase()
                .execute(AS_A, {
                    space: NoteSpaceEnum.SHARED,
                    folderId: lyon.id.getValue(),
                });
            expect(contents.cardContext).toEqual({
                folderId: restaurants.id.getValue(),
                subject: PROPOSED_TEMPLATE.subject,
                cardTemplate: PROPOSED_TEMPLATE.fieldNames,
            });
            expect(
                contents.notes.map((note) => [
                    note.title,
                    note.card?.noteCardId ?? null,
                ]),
            ).toEqual(
                expect.arrayContaining([
                    ['Chez Paul', card.id.getValue()],
                    ['À trier', null],
                ]),
            );
        });
    });
});
