import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { ok } from '@cocooning/shared-kernel/utils';
import { ServerActionNoteCommandGateway } from './server-action-note-command.gateway';

const NOTE_ID = '01936b2e-7c4a-7000-8000-0000000000d1';
const PRIVATE_ROOT = { space: NoteSpaceEnum.PRIVATE, folderId: null };
const rejects = () => Promise.reject(new TypeError('Failed to fetch'));

function sendCommand(
    gateway: ServerActionNoteCommandGateway,
    command:
        | 'createNote'
        | 'renameNote'
        | 'shareNote'
        | 'makeNotePrivate'
        | 'deleteNote',
) {
    if (command === 'createNote')
        return gateway.createNote({ title: 'Courses' }, PRIVATE_ROOT);
    if (command === 'renameNote') {
        return gateway.renameNote(NOTE_ID, { title: 'Courses' });
    }
    return gateway[command](NOTE_ID);
}

describe('Feature: note commands through the server actions', () => {
    it('gives the result of each action with its input', async () => {
        const sent: string[] = [];
        const record = (input: string) => {
            sent.push(input);
            return Promise.resolve(ok(null));
        };
        const gateway = new ServerActionNoteCommandGateway({
            createNote: (form, destination) =>
                record(`${destination.space}:${form.title}`),
            renameNote: (noteId, form) => record(`${noteId}:${form.title}`),
            shareNote: record,
            makeNotePrivate: record,
            deleteNote: record,
        });

        await expect(
            gateway.createNote({ title: 'Courses' }, PRIVATE_ROOT),
        ).resolves.toEqual(ok(null));
        await gateway.renameNote(NOTE_ID, { title: 'Courses' });
        await gateway.shareNote(NOTE_ID);
        await gateway.makeNotePrivate(NOTE_ID);
        await gateway.deleteNote(NOTE_ID);
        expect(sent).toEqual([
            'PRIVATE:Courses',
            `${NOTE_ID}:Courses`,
            NOTE_ID,
            NOTE_ID,
            NOTE_ID,
        ]);
    });

    it.each([
        'createNote',
        'renameNote',
        'shareNote',
        'makeNotePrivate',
        'deleteNote',
    ] as const)(
        'gives a network error instead of rejecting for %s',
        async (command) => {
            const gateway = new ServerActionNoteCommandGateway({
                createNote: rejects,
                renameNote: rejects,
                shareNote: rejects,
                makeNotePrivate: rejects,
                deleteNote: rejects,
            });

            const result = await sendCommand(gateway, command);
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.NETWORK_ERROR,
            );
        },
    );
});
