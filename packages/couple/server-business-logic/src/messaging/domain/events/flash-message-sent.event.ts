import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import type { MessageSentData } from './message-sent-data';
import {
    type MessagingEventParams,
    toDomainEventParams,
} from './messaging-event-params';

export class FlashMessageSentEvent extends DomainEventBase<MessageSentData> {
    static readonly EVENT_NAME = 'messaging.flash-message.sent' as const;

    constructor(params: MessagingEventParams<MessageSentData>) {
        super(toDomainEventParams(FlashMessageSentEvent.EVENT_NAME, params));
    }
}
