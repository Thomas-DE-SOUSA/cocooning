import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { readNoteEvents } from '@cocooning/couple-e2e-shared/fixtures';
import {
    Note,
    NoteRenamedEvent,
    NoteTitle,
} from '@cocooning/couple-server-business-logic/notes';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import {
    COUPLE_ID,
    NOW,
    PARTNER_A,
    PARTNER_B,
    SHARED_OF_A,
    SHARED_OF_B,
} from './note-repository-test-data';
import { NotesAdapterTestApp } from './notes-adapter-test-app';

describe('Feature: the Prisma adapter of NoteRepository, writes', () => {
    const notes = new NotesAdapterTestApp();

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    describe('Scenario: a save', () => {
        it('creates a note at version 1 with its outbox row', async () => {
            const note = Note.create(
                {
                    coupleId: COUPLE_ID,
                    ownerId: PARTNER_A,
                    title: NoteTitle.create('Restaurants'),
                    space: NoteSpaceEnum.SHARED,
                    folder: null,
                },
                NOW,
            );
            await notes.repository.save(note);
            const stored = await notes.prisma.includingDeleted.note.findFirst({
                where: { id: note.id.getValue() },
            });
            expect(stored).toMatchObject({ version: 1, visibility: 'SHARED' });
            const events = await readNoteEvents(
                notes.prisma,
                note.id.getValue(),
            );
            expect(events).toEqual([
                expect.objectContaining({ version: 1, published: false }),
            ]);
        });

        it('updates a note, increments its version and appends its event', async () => {
            const note = await notes.visibleNote(
                COUPLE_ID,
                PARTNER_B,
                SHARED_OF_A.noteId,
            );
            note.rename(PARTNER_B, NoteTitle.create('Courses du samedi'), NOW);
            await notes.repository.save(note);
            const reread = await notes.repository.findVisibleById(
                COUPLE_ID,
                PARTNER_A,
                SHARED_OF_A.noteId,
            );
            expect(reread?.toSnapshot()).toMatchObject({
                title: 'Courses du samedi',
                version: 2,
            });
            expect(
                await readNoteEvents(notes.prisma, SHARED_OF_A.noteId),
            ).toEqual([
                {
                    eventName: NoteRenamedEvent.EVENT_NAME,
                    coupleId: COUPLE_ID,
                    aggregateId: SHARED_OF_A.noteId,
                    userId: PARTNER_B,
                    version: 1,
                    published: false,
                    eventData: null,
                },
            ]);
        });

        it('hides a deleted note from both lookups', async () => {
            const note = await notes.visibleNote(
                COUPLE_ID,
                PARTNER_B,
                SHARED_OF_B.noteId,
            );
            note.delete(PARTNER_B, NOW);
            await notes.repository.save(note);
            expect(await notes.titlesSeenBy(COUPLE_ID, PARTNER_B)).toEqual([
                'Courses',
            ]);
        });

        it('refuses a stale version with NOTE_VERSION_CONFLICT', async () => {
            const first = await notes.visibleNote(
                COUPLE_ID,
                PARTNER_A,
                SHARED_OF_A.noteId,
            );
            const second = await notes.visibleNote(
                COUPLE_ID,
                PARTNER_B,
                SHARED_OF_A.noteId,
            );
            first.rename(PARTNER_A, NoteTitle.create('Un'), NOW);
            second.rename(PARTNER_B, NoteTitle.create('Deux'), NOW);
            await notes.repository.save(first);
            await expect(notes.repository.save(second)).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_VERSION_CONFLICT,
            });
        });
    });
});
