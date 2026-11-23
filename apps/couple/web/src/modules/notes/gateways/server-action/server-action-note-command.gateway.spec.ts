import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { ok } from '@cocooning/shared-kernel/utils';
import { ServerActionNoteCommandGateway } from './server-action-note-command.gateway';

const NOTE_ID = '01936b2e-7c4a-7000-8000-0000000000d1';
const rejects = () => Promise.reject(new TypeError('Failed to fetch'));

describe('Feature: note commands through the server actions', () => {
    it('gives the result of each action with its input', async () => {
        const sent: string[] = [];
        const record = (input: string) => {
            sent.push(input);
            return Promise.resolve(ok(null));
        };
        const gateway = new ServerActionNoteCommandGateway({
            createNote: (form) => record(form.title),
            shareNote: record,
            makeNotePrivate: record,
            deleteNote: record,
        });

        await expect(gateway.createNote({ title: 'Courses' })).resolves.toEqual(
            ok(null),
        );
        await gateway.shareNote(NOTE_ID);
        await gateway.makeNotePrivate(NOTE_ID);
        await gateway.deleteNote(NOTE_ID);
        expect(sent).toEqual(['Courses', NOTE_ID, NOTE_ID, NOTE_ID]);
    });

    it.each([
        'createNote',
        'shareNote',
        'makeNotePrivate',
        'deleteNote',
    ] as const)(
        'gives a network error instead of rejecting for %s',
        async (command) => {
            const gateway = new ServerActionNoteCommandGateway({
                createNote: rejects,
                shareNote: rejects,
                makeNotePrivate: rejects,
                deleteNote: rejects,
            });

            const result =
                command === 'createNote'
                    ? await gateway.createNote({ title: 'Courses' })
                    : await gateway[command](NOTE_ID);
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.NETWORK_ERROR,
            );
        },
    );
});
