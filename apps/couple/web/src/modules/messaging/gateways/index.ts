import { messagingFlashMessageSendAction } from '../actions/messaging-flash-message-send.action';
import { messagingFlashMessageWithdrawAction } from '../actions/messaging-flash-message-withdraw.action';
import { messagingInstantPhotoSendAction } from '../actions/messaging-instant-photo-send.action';
import { messagingInstantPhotoWithdrawAction } from '../actions/messaging-instant-photo-withdraw.action';
import { messagingOlderMessagesAction } from '../actions/messaging-older-messages.action';
import { messagingPhotoPromptAnswerAction } from '../actions/messaging-photo-prompt-answer.action';
import type { MessageCommandGateway } from './ports/message-command.gateway';
import type { OlderMessagesGateway } from './ports/older-messages.gateway';
import { ServerActionMessageCommandGateway } from './server-action/server-action-message-command.gateway';
import { ServerActionOlderMessagesGateway } from './server-action/server-action-older-messages.gateway';

export const messageCommandGateway: MessageCommandGateway =
    new ServerActionMessageCommandGateway({
        sendFlashMessage: messagingFlashMessageSendAction,
        withdrawFlashMessage: messagingFlashMessageWithdrawAction,
        sendInstantPhoto: messagingInstantPhotoSendAction,
        answerPhotoPrompt: messagingPhotoPromptAnswerAction,
        withdrawInstantPhoto: messagingInstantPhotoWithdrawAction,
    });

export const olderMessagesGateway: OlderMessagesGateway =
    new ServerActionOlderMessagesGateway(messagingOlderMessagesAction);
