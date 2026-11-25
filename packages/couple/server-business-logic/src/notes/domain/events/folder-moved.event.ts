import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type FolderEventParams,
    toFolderDomainEventParams,
} from './folder-event-params';

export type FolderMovedData = {
    readonly parentFolderId: string | null;
};

export class FolderMovedEvent extends DomainEventBase<FolderMovedData> {
    static readonly EVENT_NAME = 'notes.folder.moved' as const;

    constructor(params: FolderEventParams<FolderMovedData>) {
        super(toFolderDomainEventParams(FolderMovedEvent.EVENT_NAME, params));
    }
}
