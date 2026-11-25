import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type MessagingEventParams,
    toDomainEventParams,
} from './messaging-event-params';

export class InstantPhotoWithdrawnEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'messaging.instant-photo.withdrawn' as const;

    constructor(params: MessagingEventParams<null>) {
        super(
            toDomainEventParams(InstantPhotoWithdrawnEvent.EVENT_NAME, params),
        );
    }
}
