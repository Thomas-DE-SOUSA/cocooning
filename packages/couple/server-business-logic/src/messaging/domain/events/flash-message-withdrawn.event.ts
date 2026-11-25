import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type MessagingEventParams,
    toDomainEventParams,
} from './messaging-event-params';

export class FlashMessageWithdrawnEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'messaging.flash-message.withdrawn' as const;

    constructor(params: MessagingEventParams<null>) {
        super(
            toDomainEventParams(FlashMessageWithdrawnEvent.EVENT_NAME, params),
        );
    }
}
