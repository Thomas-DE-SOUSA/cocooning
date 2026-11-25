import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import type { MessageSentData } from './message-sent-data';
import {
    type MessagingEventParams,
    toDomainEventParams,
} from './messaging-event-params';

export class InstantPhotoSentEvent extends DomainEventBase<MessageSentData> {
    static readonly EVENT_NAME = 'messaging.instant-photo.sent' as const;

    constructor(params: MessagingEventParams<MessageSentData>) {
        super(toDomainEventParams(InstantPhotoSentEvent.EVENT_NAME, params));
    }
}
