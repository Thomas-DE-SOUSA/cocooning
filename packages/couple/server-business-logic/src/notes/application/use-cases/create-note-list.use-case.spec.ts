import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    NoteListKindEnum,
    NoteSpaceEnum,
    NoteVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { NoteCreatedEvent } from '../../domain/events/note-created.event';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import type { CreateNoteListCommand } from './create-note-list.use-case';
import {
    AS_A,
    COUPLE_ID,
    NOW,
    NotesTestContext,
    PARTNER_A,
} from '../../__tests__/fixtures/notes-test.context';

const NOTE_ID = '00000000-0000-7000-8000-000000000001';

describe('Feature: create a list of the Lists tab (R26)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const create = (overrides: Partial<CreateNoteListCommand> = {}) =>
        ctx.createNoteListUseCase().execute(AS_A, {
            kind: NoteListKindEnum.GROCERIES,
            space: NoteSpaceEnum.SHARED,
            title: ' Carrefour ',
            emoji: ' 🛒 ',
            ...overrides,
        });

    describe('Scenario: R1, R26, a partner creates a shared grocery list', () => {
        it('returns the list, owned by its creator, with nothing left to check', async () => {
            await expect(create()).resolves.toEqual({
                noteId: NOTE_ID,
                title: 'Carrefour',
                emoji: '🛒',
                visibility: NoteVisibilityEnum.SHARED,
                isOwner: true,
                openItemCount: 0,
                updatedAt: NOW,
            });
        });

        it('stores a note of the section, at the root of its space (R27)', async () => {
            await create();
            expect(ctx.noteRepository.storedSnapshots).toEqual([
                {
                    id: NOTE_ID,
                    coupleId: COUPLE_ID,
                    ownerId: PARTNER_A,
                    title: 'Carrefour',
                    visibility: NoteVisibilityEnum.SHARED,
                    folderId: null,
                    listKind: NoteListKindEnum.GROCERIES,
                    emoji: '🛒',
                    openItemCount: 0,
                    version: 1,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: NOW.toISOString(),
                        deletedAt: null,
                    },
                },
            ]);
        });

        it('persists then publishes the created event of a note, which notifies the other (R9), without the title or the emoji', async () => {
            await create();
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000002',
                eventName: NoteCreatedEvent.EVENT_NAME,
                aggregateId: NOTE_ID,
                context: AS_A,
                data: {
                    ownerId: PARTNER_A,
                    visibility: NoteVisibilityEnum.SHARED,
                },
                occurredAt: NOW,
            };
            expect(ctx.noteRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
            const published = JSON.stringify(ctx.eventPublisher.published);
            expect(published).not.toContain('Carrefour');
            expect(published).not.toContain('🛒');
        });
    });

    describe('Scenario: R4, R26, a list « rien que pour moi », without an emoji', () => {
        it('is private from its creation', async () => {
            await expect(
                create({ space: NoteSpaceEnum.PRIVATE, emoji: null }),
            ).resolves.toMatchObject({
                visibility: NoteVisibilityEnum.PRIVATE,
                emoji: null,
            });
            expect(ctx.noteRepository.storedSnapshots[0]).toMatchObject({
                emoji: null,
            });
        });
    });

    describe('Scenario: an invalid title or emoji', () => {
        it.each([
            [
                'an empty emoji',
                { emoji: ' ' },
                NoteExceptionCodeEnum.NOTE_LIST_EMOJI_INVALID,
            ],
            [
                'an emoji over the limit',
                { emoji: '🍎'.repeat(17) },
                NoteExceptionCodeEnum.NOTE_LIST_EMOJI_INVALID,
            ],
        ])('refuses %s and stores nothing', async (_label, overrides, code) => {
            await expect(create(overrides)).rejects.toMatchObject({ code });
            expect(ctx.noteRepository.storedSnapshots).toEqual([]);
            expect(ctx.eventPublisher.published).toEqual([]);
        });

        it('refuses an empty title (R8)', async () => {
            await expect(
                ctx.createNoteListUseCase().execute(AS_A, {
                    kind: NoteListKindEnum.TASKS,
                    space: NoteSpaceEnum.SHARED,
                    title: ' ',
                    emoji: null,
                }),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_TITLE_INVALID,
            });
        });
    });
});
