import {
    NoteCardStatusEnum,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { NoteCardTemplateAdoptedEvent } from '../../domain/events/note-card-template-adopted.event';
import { NoteMovedEvent } from '../../domain/events/note-moved.event';
import { createSmartFolderSettings } from '../../domain/models/smart-folder-settings';
import type { Note } from '../../domain/models/note.aggregate';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    NOW,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

const FOUND = {
    Adresse: '11 rue Mercière',
    Cuisine: 'Lyonnaise',
    Prix: '25 €',
};

describe('Feature: a card moves with its note (R25)', () => {
    let ctx: NotesTestContext;
    let chezPaul: Note;

    beforeEach(() => {
        ctx = new NotesTestContext();
        const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
        chezPaul = ctx.givenNoteOf(AS_A, 'Chez Paul', restaurants);
        ctx.givenFilledCardOf(chezPaul, FOUND);
    });
    afterEach(() => NoteId.resetForTests());

    const move = (folderId: string | null) =>
        ctx.moveNoteUseCase().execute(AS_B, {
            noteId: chezPaul.id.getValue(),
            space: NoteSpaceEnum.SHARED,
            folderId,
        });
    const storedCard = () => ctx.noteCardRepository.storedSnapshots[0];

    describe('Scenario: R25, into another smart folder', () => {
        it('takes its template, keeps the fields of the same name, without searching', async () => {
            const sorties = ctx.givenSmartFolderOf(AS_A, 'Sorties');
            sorties.editTemplate(
                AS_A.userId,
                createSmartFolderSettings('Nos sorties', ['prix', 'Ambiance']),
                NOW,
            );
            sorties.clearDomainEvents();
            ctx.folderRepository.seed(sorties);
            await move(sorties.id.getValue());
            expect(storedCard()).toMatchObject({
                status: NoteCardStatusEnum.FILLED,
                fields: [
                    { name: 'prix', value: '25 €', isManual: false },
                    { name: 'Ambiance', value: null, isManual: false },
                ],
            });
            expect(
                ctx.eventPublisher.published.map((event) => event.eventName),
            ).toEqual([
                NoteMovedEvent.EVENT_NAME,
                NoteCardTemplateAdoptedEvent.EVENT_NAME,
            ]);
        });
    });

    describe('Scenario: R25, out of the smart folders', () => {
        it('keeps the card as it is', async () => {
            const before = storedCard();
            const classic = ctx.givenFolderOf(AS_A, 'Divers');
            await move(classic.id.getValue());
            await move(null);
            expect(storedCard()).toEqual(before);
            expect(
                ctx.eventPublisher.published.map((event) => event.eventName),
            ).toEqual([NoteMovedEvent.EVENT_NAME, NoteMovedEvent.EVENT_NAME]);
        });
    });

    describe('Scenario: a note without card', () => {
        it('moves alone', async () => {
            const plain = ctx.givenNoteOf(AS_A, 'Courses');
            const lyon = ctx.givenSmartFolderOf(AS_A, 'Lyon');
            await ctx.moveNoteUseCase().execute(AS_A, {
                noteId: plain.id.getValue(),
                space: NoteSpaceEnum.SHARED,
                folderId: lyon.id.getValue(),
            });
            expect(ctx.noteCardRepository.storedSnapshots).toHaveLength(1);
        });
    });
});
