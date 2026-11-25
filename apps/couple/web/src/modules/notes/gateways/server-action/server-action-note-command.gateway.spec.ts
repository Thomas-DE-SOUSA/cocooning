import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { ok } from '@cocooning/shared-kernel/utils';
import { ServerActionNoteCommandGateway } from './server-action-note-command.gateway';

const NOTE_ID = '01936b2e-7c4a-7000-8000-0000000000d1';
const PRIVATE_ROOT = { space: NoteSpaceEnum.PRIVATE, folderId: null };
const rejects = () => Promise.reject(new TypeError('Failed to fetch'));

const REJECTING = new ServerActionNoteCommandGateway({
    createNote: rejects,
    renameNote: rejects,
    shareNote: rejects,
    makeNotePrivate: rejects,
    deleteNote: rejects,
    moveNote: rejects,
});

describe('Feature: note commands through the server actions', () => {
    it('gives the result of each action with its input', async () => {
        const sent: unknown[] = [];
        const record = (...input: unknown[]) => {
            sent.push(input);
            return Promise.resolve(ok(null));
        };
        const gateway = new ServerActionNoteCommandGateway({
            createNote: record,
            renameNote: record,
            shareNote: record,
            makeNotePrivate: record,
            deleteNote: record,
            moveNote: record,
        });

        await expect(
            gateway.createNote({ title: 'Courses' }, PRIVATE_ROOT),
        ).resolves.toEqual(ok(null));
        await gateway.renameNote(NOTE_ID, { title: 'Courses' });
        await gateway.shareNote(NOTE_ID);
        await gateway.makeNotePrivate(NOTE_ID);
        await gateway.deleteNote(NOTE_ID);
        await gateway.moveNote(NOTE_ID, PRIVATE_ROOT);

        expect(sent).toEqual([
            [{ title: 'Courses' }, PRIVATE_ROOT],
            [NOTE_ID, { title: 'Courses' }],
            [NOTE_ID],
            [NOTE_ID],
            [NOTE_ID],
            [NOTE_ID, PRIVATE_ROOT],
        ]);
    });

    it.each([
        [
            'createNote',
            () => REJECTING.createNote({ title: 'Courses' }, PRIVATE_ROOT),
        ],
        ['renameNote', () => REJECTING.renameNote(NOTE_ID, { title: 'C' })],
        ['shareNote', () => REJECTING.shareNote(NOTE_ID)],
        ['makeNotePrivate', () => REJECTING.makeNotePrivate(NOTE_ID)],
        ['deleteNote', () => REJECTING.deleteNote(NOTE_ID)],
        ['moveNote', () => REJECTING.moveNote(NOTE_ID, PRIVATE_ROOT)],
    ])(
        'gives a network error instead of rejecting for %s',
        async (_label, send) => {
            const result = await send();
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.NETWORK_ERROR,
            );
        },
    );
});
