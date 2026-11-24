import {
    SendFlashMessageUseCase,
    WithdrawFlashMessageUseCase,
    WithdrawInstantPhotoUseCase,
} from '@cocooning/couple-client-business-logic/messaging';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_FLASH_MESSAGE,
    AN_INSTANT_PHOTO,
    FakeFlashMessageGateway,
    FakeInstantPhotoGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import {
    sendFlashMessage,
    withdrawFlashMessage,
    withdrawInstantPhoto,
} from './message-commands.service';

const REFUSAL: ApiError = {
    code: ApiErrorCodeEnum.FORBIDDEN,
    message: 'Reserved to owner',
    backendCode: 'FLASH_MESSAGE_RESERVED_TO_OWNER',
};

const isValidationError = (result: { success: boolean; error?: ApiError }) =>
    result.success === false &&
    result.error?.code === ApiErrorCodeEnum.VALIDATION_ERROR;

describe('Feature: message commands sent by the server actions', () => {
    let flashMessages: FakeFlashMessageGateway;
    let instantPhotos: FakeInstantPhotoGateway;
    const send = (input: unknown) =>
        sendFlashMessage(input, {
            t: (key) => key,
            sendFlashMessage: new SendFlashMessageUseCase(flashMessages),
        });

    beforeEach(() => {
        flashMessages = new FakeFlashMessageGateway();
        instantPhotos = new FakeInstantPhotoGateway();
    });

    describe('Scenario: R2, a partner sends a word', () => {
        it('sends the trimmed text once', async () => {
            expect(await send({ text: '  Bisous ' })).toEqual(ok(null));
            expect(flashMessages.calls).toEqual([
                { operation: 'sendFlashMessage', request: { text: 'Bisous' } },
            ]);
        });

        it.each([
            ['an empty word', { text: '   ' }],
            ['a word over 140 signs', { text: 'a'.repeat(141) }],
            ['no text at all', { message: 'Bisous' }],
        ])(
            'refuses %s without calling the API (rule 14)',
            async (_l, input) => {
                expect(isValidationError(await send(input))).toBe(true);
                expect(flashMessages.calls).toEqual([]);
            },
        );

        it('passes the refusal of the API through', async () => {
            flashMessages.givenRefusal(REFUSAL);
            expect(await send({ text: 'Bisous' })).toEqual(fail(REFUSAL));
        });
    });

    describe('Scenario: R6, the author withdraws what they sent', () => {
        it('withdraws a word by its id', async () => {
            const useCase = new WithdrawFlashMessageUseCase(flashMessages);
            expect(
                await withdrawFlashMessage(A_FLASH_MESSAGE.id, (id) =>
                    useCase.execute(id),
                ),
            ).toEqual(ok(null));
            expect(flashMessages.calls).toEqual([
                {
                    operation: 'withdrawFlashMessage',
                    flashMessageId: A_FLASH_MESSAGE.id,
                },
            ]);
        });

        it('withdraws a photo by its id', async () => {
            const useCase = new WithdrawInstantPhotoUseCase(instantPhotos);
            expect(
                await withdrawInstantPhoto(AN_INSTANT_PHOTO.id, (id) =>
                    useCase.execute(id),
                ),
            ).toEqual(ok(null));
            expect(instantPhotos.calls).toEqual([
                {
                    operation: 'withdrawInstantPhoto',
                    instantPhotoId: AN_INSTANT_PHOTO.id,
                },
            ]);
        });

        it.each([
            ['a word', withdrawFlashMessage],
            ['a photo', withdrawInstantPhoto],
        ])('refuses an id that is not one for %s', async (_l, withdraw) => {
            const sent: string[] = [];
            const result = await withdraw('../couple', (id) => {
                sent.push(id);
                return Promise.resolve(ok(null));
            });
            expect(isValidationError(result)).toBe(true);
            expect(sent).toEqual([]);
        });
    });
});
