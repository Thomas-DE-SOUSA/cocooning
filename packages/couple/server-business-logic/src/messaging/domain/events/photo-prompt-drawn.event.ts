import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type MessagingEventParams,
    toDomainEventParams,
} from './messaging-event-params';

// The drawn time stays out of the event: the prompt is secret until issued (R7).
export class PhotoPromptDrawnEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'messaging.photo-prompt.drawn' as const;

    constructor(params: MessagingEventParams<null>) {
        super(toDomainEventParams(PhotoPromptDrawnEvent.EVENT_NAME, params));
    }
}
