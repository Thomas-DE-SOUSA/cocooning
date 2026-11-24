import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type MessagingEventParams,
    toDomainEventParams,
} from './messaging-event-params';

// R7, R10: the relay will invite both partners of the couple at once ("C'est l'heure de la photo").
export class PhotoPromptIssuedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'messaging.photo-prompt.issued' as const;

    constructor(params: MessagingEventParams<null>) {
        super(toDomainEventParams(PhotoPromptIssuedEvent.EVENT_NAME, params));
    }
}
