import type { MessageCommand } from '../view-models/message-command.view-model';

// Keys of the messaging namespace: the short confirmation of each command, and the title of its failure toast.
export const MESSAGE_DONE_KEYS: Readonly<Record<MessageCommand, string>> = {
    SEND_FLASH_MESSAGE: 'toast.flashMessageSent',
    SEND_READY_WORD: 'toast.flashMessageSent',
    SEND_INSTANT_PHOTO: 'toast.instantPhotoSent',
    WITHDRAW: 'toast.withdrawn',
};

export const MESSAGE_FAILURE_KEYS: Readonly<Record<MessageCommand, string>> = {
    SEND_FLASH_MESSAGE: 'toast.flashMessageFailed',
    SEND_READY_WORD: 'toast.flashMessageFailed',
    SEND_INSTANT_PHOTO: 'toast.instantPhotoFailed',
    WITHDRAW: 'toast.withdrawFailed',
};
