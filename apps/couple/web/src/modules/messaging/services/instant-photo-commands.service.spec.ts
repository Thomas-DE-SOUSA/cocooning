/**
 * @jest-environment node
 */
import {
    AnswerPhotoPromptUseCase,
    SendInstantPhotoUseCase,
} from '@cocooning/couple-client-business-logic/messaging';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_PHOTO_PROMPT_ID,
    FakeInstantPhotoGateway,
    FakePhotoPromptGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { INSTANT_PHOTO_MAX_BYTES } from '@cocooning/couple-shared-kernel/limits';
import { ok } from '@cocooning/shared-kernel/utils';
import {
    answerPhotoPrompt,
    sendInstantPhoto,
} from './instant-photo-commands.service';

const BYTES = [0xff, 0xd8, 0xff, 0xe0];
const aPhoto = (type: string) =>
    new File([new Uint8Array(BYTES)], 'IMG_0001.HEIC', { type });
const isValidationError = (
    result: Awaited<ReturnType<typeof sendInstantPhoto>>,
) =>
    result.success === false &&
    result.error.code === ApiErrorCodeEnum.VALIDATION_ERROR;

describe('Feature: photos sent by the server actions (R3)', () => {
    describe('Scenario: a spontaneous photo', () => {
        it('sends its bytes, declared type and name, whatever the type the phone declares', async () => {
            const gateway = new FakeInstantPhotoGateway();

            const result = await sendInstantPhoto(
                aPhoto('image/heif'),
                new SendInstantPhotoUseCase(gateway),
            );

            expect(result).toEqual(ok(null));
            expect(gateway.calls).toEqual([
                {
                    operation: 'sendInstantPhoto',
                    photo: {
                        bytes: new Uint8Array(BYTES),
                        contentType: 'image/heif',
                        fileName: 'IMG_0001.HEIC',
                    },
                },
            ]);
        });

        it.each([
            ['no photo', 'not a file'],
            ['an empty photo', new File([], 'empty.jpg')],
            [
                'a photo over 10 MB',
                new File(
                    [new Uint8Array(INSTANT_PHOTO_MAX_BYTES + 1)],
                    'big.jpg',
                ),
            ],
        ])(
            'refuses %s without calling the API (rule 14)',
            async (_l, photo) => {
                const gateway = new FakeInstantPhotoGateway();

                const result = await sendInstantPhoto(
                    photo,
                    new SendInstantPhotoUseCase(gateway),
                );

                expect(isValidationError(result)).toBe(true);
                expect(gateway.calls).toEqual([]);
            },
        );
    });

    describe('Scenario: R8, the photo of the day', () => {
        it("answers today's prompt", async () => {
            const gateway = new FakePhotoPromptGateway();

            const result = await answerPhotoPrompt(
                A_PHOTO_PROMPT_ID,
                aPhoto(''),
                new AnswerPhotoPromptUseCase(gateway),
            );

            expect(result).toEqual(ok(null));
            expect(gateway.calls).toMatchObject([
                {
                    operation: 'answerPhotoPrompt',
                    photoPromptId: A_PHOTO_PROMPT_ID,
                    photo: { contentType: '' },
                },
            ]);
        });

        it('refuses a prompt id that is not one', async () => {
            const gateway = new FakePhotoPromptGateway();

            const result = await answerPhotoPrompt(
                'today',
                aPhoto('image/jpeg'),
                new AnswerPhotoPromptUseCase(gateway),
            );

            expect(isValidationError(result)).toBe(true);
            expect(gateway.calls).toEqual([]);
        });
    });
});
