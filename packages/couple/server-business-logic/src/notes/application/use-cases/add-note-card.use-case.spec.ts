import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    NoteCardStatusEnum,
    NoteSpaceEnum,
    NoteVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { NoteCardRequestedEvent } from '../../domain/events/note-card-requested.event';
import { NoteCreatedEvent } from '../../domain/events/note-created.event';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    COUPLE_ID,
    NOW,
    NotesTestContext,
    PARTNER_B,
} from '../../__tests__/fixtures/notes-test.context';

// The smart folder takes ids 1 and 2 (folder, cleared event); then the note 3, its event 4, the card 5, its event 6.
const NOTE_ID = '00000000-0000-7000-8000-000000000003';
const CARD_ID = '00000000-0000-7000-8000-000000000005';
const EMPTY_FIELDS = [
    { name: 'Adresse', value: null, isManual: false },
    { name: 'Cuisine', value: null, isManual: false },
    { name: 'Prix', value: null, isManual: false },
];

describe('Feature: add an item to a smart folder by its name (R19, R20)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const add = (context: typeof AS_A, folderId: string, name: string) =>
        ctx.addNoteCardUseCase().execute(context, { folderId, name });

    describe('Scenario: R19, R20, the other partner types « Chez Paul » in « Restaurants »', () => {
        it('creates the note at once with its card « en recherche »', async () => {
            const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
            const folderId = restaurants.id.getValue();
            await expect(add(AS_B, folderId, ' Chez Paul ')).resolves.toEqual({
                noteId: NOTE_ID,
                ownerId: PARTNER_B,
                isOwner: true,
                title: 'Chez Paul',
                visibility: NoteVisibilityEnum.SHARED,
                folderId,
                updatedAt: NOW,
                card: {
                    noteCardId: CARD_ID,
                    noteId: NOTE_ID,
                    status: NoteCardStatusEnum.PENDING,
                    query: 'Chez Paul',
                    fields: EMPTY_FIELDS,
                    candidates: [],
                    sources: [],
                    searchedAt: null,
                    updatedAt: NOW,
                },
                listKind: null,
                emoji: null,
            });
            expect(ctx.noteCardRepository.storedSnapshots).toEqual([
                {
                    id: CARD_ID,
                    coupleId: COUPLE_ID,
                    noteId: NOTE_ID,
                    status: NoteCardStatusEnum.PENDING,
                    query: 'Chez Paul',
                    fields: EMPTY_FIELDS,
                    candidates: [],
                    sources: [],
                    searchedAt: null,
                    requestedBy: PARTNER_B,
                    version: 1,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: NOW.toISOString(),
                        deletedAt: null,
                    },
                },
            ]);
            expect(ctx.noteRepository.storedSnapshots).toEqual([
                expect.objectContaining({
                    id: NOTE_ID,
                    folderId,
                    title: 'Chez Paul',
                }),
            ]);
        });

        it('persists and publishes the creation of the note and the request of the card, without the name', async () => {
            const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
            await add(AS_B, restaurants.id.getValue(), 'Chez Paul');
            const requested = {
                eventId: '00000000-0000-7000-8000-000000000006',
                eventName: NoteCardRequestedEvent.EVENT_NAME,
                aggregateId: CARD_ID,
                context: AS_B,
                data: { noteId: NOTE_ID, status: NoteCardStatusEnum.PENDING },
                occurredAt: NOW,
            };
            expect(ctx.noteCardRepository.persistedEvents).toEqual([requested]);
            expect(ctx.eventPublisher.published).toEqual([
                expect.objectContaining({
                    eventName: NoteCreatedEvent.EVENT_NAME,
                    aggregateId: NOTE_ID,
                }),
                requested,
            ]);
            expect(JSON.stringify(ctx.eventPublisher.published)).not.toContain(
                'Chez Paul',
            );
        });
    });

    describe('Scenario: R18, in « Lyon » inside « Restaurants »', () => {
        it('gives the card the template of « Restaurants »', async () => {
            const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
            const lyon = ctx.givenSmartFolderOf(AS_A, 'Lyon', restaurants);
            const view = await add(AS_A, lyon.id.getValue(), 'Chez Paul');
            expect(view.card?.fields).toEqual(EMPTY_FIELDS);
        });
    });

    describe('Scenario: R11, a smart folder of « Privé »', () => {
        it('makes the note private, like its space', async () => {
            const cadeaux = ctx.givenSmartFolderOf(
                AS_A,
                'Cadeaux',
                null,
                NoteSpaceEnum.PRIVATE,
            );
            const view = await add(AS_A, cadeaux.id.getValue(), 'Montre');
            expect(view.visibility).toBe(NoteVisibilityEnum.PRIVATE);
        });
    });

    describe('Scenario: a folder that is not smart, or not seen', () => {
        it('refuses a classic folder and stores nothing', async () => {
            const sorties = ctx.givenFolderOf(AS_A, 'Sorties');
            await expect(
                add(AS_A, sorties.id.getValue(), 'Chez Paul'),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NOT_SMART,
            });
            expect(ctx.noteRepository.storedSnapshots).toEqual([]);
            expect(ctx.noteCardRepository.storedSnapshots).toEqual([]);
            expect(ctx.eventPublisher.published).toEqual([]);
        });

        it.each([
            ['the other partner', AS_B],
            ['another couple', AS_STRANGER],
        ])(
            'answers not found to %s for a private smart folder',
            async (_label, context) => {
                const cadeaux = ctx.givenSmartFolderOf(
                    AS_A,
                    'Cadeaux',
                    null,
                    NoteSpaceEnum.PRIVATE,
                );
                await expect(
                    add(context, cadeaux.id.getValue(), 'Montre'),
                ).rejects.toMatchObject({
                    code: NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
                });
            },
        );

        it('refuses an empty name before loading anything', async () => {
            const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
            await expect(
                add(AS_A, restaurants.id.getValue(), ' '),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_TITLE_INVALID,
            });
        });
    });
});
