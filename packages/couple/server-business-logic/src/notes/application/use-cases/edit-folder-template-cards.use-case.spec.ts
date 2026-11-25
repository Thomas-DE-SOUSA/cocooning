import { NoteCardStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { NoteCardTemplateAdoptedEvent } from '../../domain/events/note-card-template-adopted.event';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

const FOUND = {
    Adresse: '11 rue Mercière',
    Cuisine: 'Lyonnaise',
    Prix: '25 €',
};

describe('Feature: the cards follow the template of their tree (R18, R22)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const statusOf = (noteId: NoteId) =>
        ctx.noteCardRepository.storedSnapshots.find(
            (card) => card.noteId === noteId.getValue(),
        );

    describe('Scenario: R22, a field is added to the template of « Restaurants »', () => {
        it('searches it on the filled cards of the whole tree, keeping the other values', async () => {
            const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
            const lyon = ctx.givenSmartFolderOf(AS_A, 'Lyon', restaurants);
            const inLyon = ctx.givenNoteOf(AS_A, 'Chez Paul', lyon);
            const pending = ctx.givenNoteOf(AS_A, 'Le Bouchon', restaurants);
            const outside = ctx.givenNoteOf(AS_A, 'Ailleurs');
            ctx.givenFilledCardOf(inLyon, FOUND);
            ctx.givenCardOf(pending);
            ctx.givenFilledCardOf(outside, FOUND);
            await ctx.editFolderTemplateUseCase().execute(AS_B, {
                folderId: lyon.id.getValue(),
                subject: 'Nos restaurants',
                cardTemplate: ['Adresse', 'Prix', 'Horaires'],
            });
            expect(statusOf(inLyon.id)).toMatchObject({
                status: NoteCardStatusEnum.PENDING,
                fields: [
                    {
                        name: 'Adresse',
                        value: '11 rue Mercière',
                        isManual: false,
                    },
                    { name: 'Prix', value: '25 €', isManual: false },
                    { name: 'Horaires', value: null, isManual: false },
                ],
            });
            expect(statusOf(pending.id)).toMatchObject({
                status: NoteCardStatusEnum.PENDING,
            });
            expect(statusOf(outside.id)).toMatchObject({
                status: NoteCardStatusEnum.FILLED,
                version: 2,
            });
            expect(
                ctx.noteCardRepository.persistedEvents.map(
                    (event) => event.eventName,
                ),
            ).toEqual([
                NoteCardTemplateAdoptedEvent.EVENT_NAME,
                NoteCardTemplateAdoptedEvent.EVENT_NAME,
            ]);
        });
    });

    describe('Scenario: R22, a field is only removed', () => {
        it('drops it and leaves the filled card filled', async () => {
            const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
            const note = ctx.givenNoteOf(AS_A, 'Chez Paul', restaurants);
            ctx.givenFilledCardOf(note, FOUND);
            await ctx.editFolderTemplateUseCase().execute(AS_A, {
                folderId: restaurants.id.getValue(),
                subject: 'Nos restaurants',
                cardTemplate: ['Adresse'],
            });
            expect(statusOf(note.id)).toMatchObject({
                status: NoteCardStatusEnum.FILLED,
                fields: [
                    {
                        name: 'Adresse',
                        value: '11 rue Mercière',
                        isManual: false,
                    },
                ],
            });
        });
    });
});
