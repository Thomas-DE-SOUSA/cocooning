import { fail, ok } from '@cocooning/shared-kernel/utils';
import { ApiErrorCodeEnum } from '../../../shared/api-error';
import { FakePhotoPromptGateway } from '../../../testing/fake-photo-prompt.gateway';
import {
    A_PHOTO_PROMPT_ID,
    A_TODAY_PHOTO_PROMPT,
    AN_INSTANT_PHOTO,
    AN_INSTANT_PHOTO_UPLOAD,
} from '../../../testing/messaging-fixtures';
import { AnswerPhotoPromptUseCase } from './answer-photo-prompt.use-case';
import { GetTodayPhotoPromptUseCase } from './get-today-photo-prompt.use-case';

const EXPIRED = {
    code: ApiErrorCodeEnum.CONFLICT,
    message: 'Photo prompt expired',
    backendCode: 'PHOTO_PROMPT_EXPIRED',
};

describe('Feature: the photo of the day from the PWA', () => {
    let gateway: FakePhotoPromptGateway;

    beforeEach(() => {
        gateway = new FakePhotoPromptGateway();
    });

    it('reads the photo prompt of the day (R7)', async () => {
        await expect(
            new GetTodayPhotoPromptUseCase(gateway).execute(),
        ).resolves.toEqual(ok(A_TODAY_PHOTO_PROMPT));
    });

    it('answers the photo prompt with a photo (R8)', async () => {
        await expect(
            new AnswerPhotoPromptUseCase(gateway).execute(
                A_PHOTO_PROMPT_ID,
                AN_INSTANT_PHOTO_UPLOAD,
            ),
        ).resolves.toEqual(
            ok({ ...AN_INSTANT_PHOTO, photoPromptId: A_PHOTO_PROMPT_ID }),
        );
        expect(gateway.calls).toEqual([
            {
                operation: 'answerPhotoPrompt',
                photoPromptId: A_PHOTO_PROMPT_ID,
                photo: AN_INSTANT_PHOTO_UPLOAD,
            },
        ]);
    });

    it('returns the refusal of the API unchanged (R8)', async () => {
        gateway.givenRefusal(EXPIRED);
        await expect(
            new AnswerPhotoPromptUseCase(gateway).execute(
                A_PHOTO_PROMPT_ID,
                AN_INSTANT_PHOTO_UPLOAD,
            ),
        ).resolves.toEqual(fail(EXPIRED));
    });
});
