import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteCardStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { NoteCardCorrectedEvent } from '../../domain/events/note-card-corrected.event';
import { NoteCardRequestedEvent } from '../../domain/events/note-card-requested.event';
import type { Note } from '../../domain/models/note.aggregate';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    NotesTestContext,
    PARTNER_B,
} from '../../__tests__/fixtures/notes-test.context';

const LATER = new Date('2026-11-23T11:00:00.000Z');
const CANDIDATES = [
    { label: 'Chez Paul', detail: 'Lyon 2e, bouchon' },
    { label: 'Chez Paul', detail: 'Paris 11e, bistrot' },
];
const FOUND = { Adresse: '11 rue Mercière', Cuisine: 'Lyonnaise', Prix: null };

describe('Feature: the partners act on the card of a note (R19 to R22)', () => {
    let ctx: NotesTestContext;
    let chezPaul: Note;

    beforeEach(() => {
        ctx = new NotesTestContext();
        const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
        chezPaul = ctx.givenNoteOf(AS_A, 'Chez Paul', restaurants);
    });
    afterEach(() => NoteId.resetForTests());

    const noteId = () => chezPaul.id.getValue();
    const later = () => ctx.dateTimeProvider.setNow(LATER);

    describe('Scenario: R19, the other partner chooses a candidate', () => {
        it('searches again with it and records one request', async () => {
            const card = ctx.givenChoosingCardOf(chezPaul, CANDIDATES);
            later();
            const view = await ctx
                .chooseNoteCardCandidateUseCase()
                .execute(AS_B, { noteId: noteId(), candidateIndex: 1 });
            expect(view).toMatchObject({
                noteCardId: card.id.getValue(),
                status: NoteCardStatusEnum.PENDING,
                query: 'Chez Paul, Paris 11e, bistrot',
                candidates: [],
                updatedAt: LATER,
            });
            expect(ctx.noteCardRepository.storedSnapshots[0]).toMatchObject({
                requestedBy: PARTNER_B,
                version: 3,
            });
            expect(ctx.eventPublisher.published).toEqual([
                expect.objectContaining({
                    eventName: NoteCardRequestedEvent.EVENT_NAME,
                    context: AS_B,
                    data: {
                        noteId: noteId(),
                        status: NoteCardStatusEnum.PENDING,
                    },
                    occurredAt: LATER,
                }),
            ]);
        });

        it('refuses a candidate the card does not show', async () => {
            ctx.givenChoosingCardOf(chezPaul, CANDIDATES);
            await expect(
                ctx
                    .chooseNoteCardCandidateUseCase()
                    .execute(AS_A, { noteId: noteId(), candidateIndex: 2 }),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_CARD_CANDIDATE_INVALID,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });

        it('refuses when the card shows no candidate', async () => {
            ctx.givenFilledCardOf(chezPaul, FOUND);
            await expect(
                ctx
                    .chooseNoteCardCandidateUseCase()
                    .execute(AS_A, { noteId: noteId(), candidateIndex: 0 }),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_CARD_STATUS_INVALID,
            });
        });
    });

    describe('Scenario: R19, « je précise »', () => {
        it('searches again with what was typed', async () => {
            ctx.givenChoosingCardOf(chezPaul, CANDIDATES);
            const view = await ctx
                .refineNoteCardUseCase()
                .execute(AS_A, { noteId: noteId(), query: ' Chez Paul Lyon ' });
            expect(view).toMatchObject({
                status: NoteCardStatusEnum.PENDING,
                query: 'Chez Paul Lyon',
            });
        });

        it('refuses while a search is in progress, and an empty query', async () => {
            ctx.givenCardOf(chezPaul);
            const refine = (query: string) =>
                ctx
                    .refineNoteCardUseCase()
                    .execute(AS_A, { noteId: noteId(), query });
            await expect(refine('Chez Paul Lyon')).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_CARD_STATUS_INVALID,
            });
            await expect(refine(' ')).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_CARD_QUERY_INVALID,
            });
        });
    });

    describe('Scenario: R22, a partner corrects a field by hand', () => {
        it('keeps the value as manual and records one event without it', async () => {
            ctx.givenFilledCardOf(chezPaul, FOUND);
            const view = await ctx.correctNoteCardFieldUseCase().execute(AS_B, {
                noteId: noteId(),
                name: 'prix',
                value: ' 25 € ',
            });
            expect(view.fields).toEqual([
                { name: 'Adresse', value: '11 rue Mercière', isManual: false },
                { name: 'Cuisine', value: 'Lyonnaise', isManual: false },
                { name: 'Prix', value: '25 €', isManual: true },
            ]);
            expect(ctx.eventPublisher.published).toEqual([
                expect.objectContaining({
                    eventName: NoteCardCorrectedEvent.EVENT_NAME,
                    data: {
                        noteId: noteId(),
                        status: NoteCardStatusEnum.FILLED,
                    },
                }),
            ]);
            expect(JSON.stringify(ctx.eventPublisher.published)).not.toContain(
                '25',
            );
        });

        it.each([
            ['a field the card does not have', 'Horaires', '12h'],
            ['an empty value', 'Prix', '  '],
            ['a value one sign too long', 'Prix', 'a'.repeat(301)],
        ])('refuses %s', async (_label, name, value) => {
            ctx.givenFilledCardOf(chezPaul, FOUND);
            await expect(
                ctx
                    .correctNoteCardFieldUseCase()
                    .execute(AS_A, { noteId: noteId(), name, value }),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_CARD_FIELD_INVALID,
            });
        });
    });

    describe('Scenario: R20, R22, « Mettre à jour »', () => {
        it('searches again with the template of the folder, keeping the fields corrected by hand', async () => {
            const card = ctx.givenFilledCardOf(chezPaul, FOUND);
            card.correctField(
                AS_A.userId,
                'Prix',
                '25 €',
                ctx.dateTimeProvider.now(),
            );
            card.clearDomainEvents();
            ctx.noteCardRepository.seed(card);
            later();
            const view = await ctx
                .refreshNoteCardUseCase()
                .execute(AS_B, { noteId: noteId() });
            expect(view).toMatchObject({
                status: NoteCardStatusEnum.PENDING,
                fields: [
                    {
                        name: 'Adresse',
                        value: '11 rue Mercière',
                        isManual: false,
                    },
                    { name: 'Cuisine', value: 'Lyonnaise', isManual: false },
                    { name: 'Prix', value: '25 €', isManual: true },
                ],
            });
        });

        it('refuses while a search is in progress', async () => {
            ctx.givenCardOf(chezPaul);
            await expect(
                ctx
                    .refreshNoteCardUseCase()
                    .execute(AS_A, { noteId: noteId() }),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_CARD_STATUS_INVALID,
            });
        });

        it('refuses outside a smart folder (R25)', async () => {
            const outside = ctx.givenNoteOf(AS_A, 'Chez Paul');
            ctx.givenFilledCardOf(outside, FOUND);
            await expect(
                ctx
                    .refreshNoteCardUseCase()
                    .execute(AS_A, { noteId: outside.id.getValue() }),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NOT_SMART,
            });
        });
    });

    describe('Scenario: R4, R20, a note without card or not seen', () => {
        it('answers NOTE_CARD_NOT_FOUND for a note without card', async () => {
            await expect(
                ctx
                    .refreshNoteCardUseCase()
                    .execute(AS_A, { noteId: noteId() }),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_CARD_NOT_FOUND,
            });
        });

        it('answers NOTE_NOT_FOUND to another couple', async () => {
            ctx.givenFilledCardOf(chezPaul, FOUND);
            await expect(
                ctx
                    .correctNoteCardFieldUseCase()
                    .execute(AS_STRANGER, {
                        noteId: noteId(),
                        name: 'Prix',
                        value: '1',
                    }),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_NOT_FOUND,
            });
        });
    });
});
