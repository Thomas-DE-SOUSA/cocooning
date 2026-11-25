import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { fail } from '@cocooning/shared-kernel/utils';
import { act, renderHook } from '@testing-library/react';
import { FakeMessageCommandGateway } from '../gateways/fake/fake-message-command.gateway';
import { MessageCommandEnum } from '../view-models/message-command.view-model';
import {
    type MessageFeedEntry,
    MessageFeedEntryKindEnum,
} from '../view-models/message-feed.view-model';
import { useMessageCommands } from './use-message-commands';

const PROMPT_ID = '01936b2e-7c4a-7000-8000-0000000000b1';
const A_PHOTO = new File([new Uint8Array([1])], 'photo.jpg');
const MY_WORD: MessageFeedEntry = {
    kind: MessageFeedEntryKindEnum.FLASH_MESSAGE,
    id: 'word-1',
    isOwner: true,
    time: '18:22',
    text: "Je t'aime",
};
const MY_PHOTO: MessageFeedEntry = {
    kind: MessageFeedEntryKindEnum.INSTANT_PHOTO,
    id: 'photo-1',
    isOwner: true,
    time: '14:40',
    src: '/api/instant-photos/photo-1',
    isPhotoOfTheDay: true,
    isLate: true,
};
const REFUSAL: ApiError = {
    code: ApiErrorCodeEnum.CONFLICT,
    message: 'Already answered',
    backendCode: 'PHOTO_PROMPT_ALREADY_ANSWERED',
};

function renderCommands(gateway: FakeMessageCommandGateway) {
    const events: string[] = [];
    const { result } = renderHook(() =>
        useMessageCommands({
            gateway,
            onDone: (command) => events.push(`${command}:done`),
            onFailed: (command, error) =>
                events.push(`${command}:${error.code}`),
        }),
    );
    return { result, events };
}

describe('Feature: the commands of the messages screen', () => {
    it('R2, sends a typed word and a ready-made word as flash messages', async () => {
        const gateway = new FakeMessageCommandGateway();
        const { result, events } = renderCommands(gateway);

        await act(async () =>
            result.current.sendFlashMessage({ text: 'Coucou' }),
        );
        await act(async () => result.current.sendReadyWord('Bisous'));

        expect(gateway.calls).toEqual([
            { operation: 'sendFlashMessage', form: { text: 'Coucou' } },
            { operation: 'sendFlashMessage', form: { text: 'Bisous' } },
        ]);
        expect(events).toEqual([
            `${MessageCommandEnum.SEND_FLASH_MESSAGE}:done`,
            `${MessageCommandEnum.SEND_READY_WORD}:done`,
        ]);
    });

    it('R3, R8, sends a spontaneous photo, or answers the prompt the camera was opened for', async () => {
        const gateway = new FakeMessageCommandGateway();
        const { result } = renderCommands(gateway);
        const captured = { file: A_PHOTO, previewUrl: 'blob:1' };

        await act(async () =>
            result.current.sendPhoto({ ...captured, photoPromptId: null }),
        );
        await act(async () =>
            result.current.sendPhoto({ ...captured, photoPromptId: PROMPT_ID }),
        );

        expect(gateway.calls).toEqual([
            { operation: 'sendInstantPhoto', fileName: 'photo.jpg' },
            {
                operation: 'answerPhotoPrompt',
                photoPromptId: PROMPT_ID,
                fileName: 'photo.jpg',
            },
        ]);
    });

    it('R6, withdraws a word and a photo by their own commands', async () => {
        const gateway = new FakeMessageCommandGateway();
        const { result } = renderCommands(gateway);

        await act(async () => result.current.withdraw(MY_WORD));
        await act(async () => result.current.withdraw(MY_PHOTO));

        expect(gateway.calls).toEqual([
            { operation: 'withdrawFlashMessage', id: 'word-1' },
            { operation: 'withdrawInstantPhoto', id: 'photo-1' },
        ]);
    });

    it('reports a refusal of the API with its command', async () => {
        const gateway = new FakeMessageCommandGateway();
        gateway.givenOutcome('answerPhotoPrompt', fail(REFUSAL));
        const { result, events } = renderCommands(gateway);

        await act(async () =>
            result.current.sendPhoto({
                file: A_PHOTO,
                previewUrl: 'blob:1',
                photoPromptId: PROMPT_ID,
            }),
        );

        expect(events).toEqual([
            `${MessageCommandEnum.SEND_INSTANT_PHOTO}:CONFLICT`,
        ]);
        expect(result.current.pending).toBeNull();
    });
});
