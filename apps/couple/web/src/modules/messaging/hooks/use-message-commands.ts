import type { FlashMessageForm } from '@cocooning/couple-client-business-logic/messaging';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { useCallback, useState, useTransition } from 'react';
import type { MessageCommandGateway } from '../gateways/ports/message-command.gateway';
import {
    type CapturedPhoto,
    type MessageCommand,
    MessageCommandEnum,
} from '../view-models/message-command.view-model';
import {
    type MessageFeedEntry,
    MessageFeedEntryKindEnum,
} from '../view-models/message-feed.view-model';

type Options = {
    readonly gateway: MessageCommandGateway;
    readonly onDone: (command: MessageCommand) => void;
    readonly onFailed: (command: MessageCommand, error: ApiError) => void;
};

type Send = () => Promise<Result<null, ApiError>>;

// R8: a photo taken for today's prompt answers it; any other photo is spontaneous.
const sendPhoto = (gateway: MessageCommandGateway, photo: CapturedPhoto) =>
    photo.photoPromptId === null
        ? gateway.sendInstantPhoto(photo.file)
        : gateway.answerPhotoPrompt(photo.photoPromptId, photo.file);

// R6: a word and a photo are withdrawn by their own commands.
const withdraw = (gateway: MessageCommandGateway, entry: MessageFeedEntry) =>
    entry.kind === MessageFeedEntryKindEnum.FLASH_MESSAGE
        ? gateway.withdrawFlashMessage(entry.id)
        : gateway.withdrawInstantPhoto(entry.id);

// One command at a time: every button waits while isBusy, only the pending one spins.
export function useMessageCommands({ gateway, onDone, onFailed }: Options) {
    const [isPending, startTransition] = useTransition();
    const [lastCommand, setLastCommand] = useState<MessageCommand | null>(null);
    const run = useCallback(
        (command: MessageCommand, send: Send) => {
            setLastCommand(command);
            startTransition(async () => {
                const result = await send();
                if (result.success) {
                    onDone(command);
                    return;
                }
                onFailed(command, result.error);
            });
        },
        [onDone, onFailed],
    );
    return {
        sendFlashMessage: (form: FlashMessageForm) =>
            run(MessageCommandEnum.SEND_FLASH_MESSAGE, () =>
                gateway.sendFlashMessage(form),
            ),
        sendReadyWord: (text: string) =>
            run(MessageCommandEnum.SEND_READY_WORD, () =>
                gateway.sendFlashMessage({ text }),
            ),
        sendPhoto: (photo: CapturedPhoto) =>
            run(MessageCommandEnum.SEND_INSTANT_PHOTO, () =>
                sendPhoto(gateway, photo),
            ),
        withdraw: (entry: MessageFeedEntry) =>
            run(MessageCommandEnum.WITHDRAW, () => withdraw(gateway, entry)),
        pending: isPending ? lastCommand : null,
        isBusy: isPending,
    };
}
