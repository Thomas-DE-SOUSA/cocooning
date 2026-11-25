import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type FolderEventParams,
    toFolderDomainEventParams,
} from './folder-event-params';

export class FolderRenamedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'notes.folder.renamed' as const;

    constructor(params: FolderEventParams<null>) {
        super(toFolderDomainEventParams(FolderRenamedEvent.EVENT_NAME, params));
    }
}
