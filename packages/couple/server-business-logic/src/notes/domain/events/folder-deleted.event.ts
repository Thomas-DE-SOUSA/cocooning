import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type FolderEventParams,
    toFolderDomainEventParams,
} from './folder-event-params';

export class FolderDeletedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'notes.folder.deleted' as const;

    constructor(params: FolderEventParams<null>) {
        super(toFolderDomainEventParams(FolderDeletedEvent.EVENT_NAME, params));
    }
}
