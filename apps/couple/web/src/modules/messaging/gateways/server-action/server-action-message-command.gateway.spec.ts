import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { INSTANT_PHOTO_FORM_FIELD } from '@cocooning/couple-contract/messaging';
import { ok } from '@cocooning/shared-kernel/utils';
import { ServerActionMessageCommandGateway } from './server-action-message-command.gateway';
import { ServerActionOlderMessagesGateway } from './server-action-older-messages.gateway';

const PROMPT_ID = '01936b2e-7c4a-7000-8000-0000000000b1';
const A_PHOTO = new File([new Uint8Array([1])], 'photo.jpg');
const rejects = () => Promise.reject(new TypeError('Failed to fetch'));
const nameOf = (form: FormData) => {
    const photo = form.get(INSTANT_PHOTO_FORM_FIELD);
    return photo instanceof File ? photo.name : 'none';
};

describe('Feature: message commands through the server actions', () => {
    it('gives each action its input, a photo in the multipart field of the API', async () => {
        const sent: string[] = [];
        const record = (input: string) => {
            sent.push(input);
            return Promise.resolve(ok(null));
        };
        const gateway = new ServerActionMessageCommandGateway({
            sendFlashMessage: (input) => record(input.text),
            withdrawFlashMessage: record,
            sendInstantPhoto: (form) => record(nameOf(form)),
            answerPhotoPrompt: (id, form) => record(`${id}|${nameOf(form)}`),
            withdrawInstantPhoto: record,
        });

        await gateway.sendFlashMessage({ text: 'Bisous' });
        await gateway.withdrawFlashMessage('word-1');
        await gateway.sendInstantPhoto(A_PHOTO);
        await gateway.answerPhotoPrompt(PROMPT_ID, A_PHOTO);
        await gateway.withdrawInstantPhoto('photo-1');

        expect(sent).toEqual([
            'Bisous',
            'word-1',
            'photo.jpg',
            `${PROMPT_ID}|photo.jpg`,
            'photo-1',
        ]);
    });

    it('gives a network error instead of rejecting', async () => {
        const gateway = new ServerActionMessageCommandGateway({
            sendFlashMessage: rejects,
            withdrawFlashMessage: rejects,
            sendInstantPhoto: rejects,
            answerPhotoPrompt: rejects,
            withdrawInstantPhoto: rejects,
        });
        const older = new ServerActionOlderMessagesGateway(rejects);

        const results = await Promise.all([
            gateway.sendFlashMessage({ text: 'Bisous' }),
            gateway.sendInstantPhoto(A_PHOTO),
            older.listOlderMessages('word-1'),
        ]);

        expect(
            results.map(
                (result) => result.success === false && result.error.code,
            ),
        ).toEqual([
            ApiErrorCodeEnum.NETWORK_ERROR,
            ApiErrorCodeEnum.NETWORK_ERROR,
            ApiErrorCodeEnum.NETWORK_ERROR,
        ]);
    });
});
