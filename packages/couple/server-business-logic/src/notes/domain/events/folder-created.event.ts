import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type FolderEventParams,
    toFolderDomainEventParams,
} from './folder-event-params';

export type FolderCreatedData = {
    readonly ownerId: string;
    readonly space: NoteSpace;
    readonly parentFolderId: string | null;
};

// The name belongs to the couple: no event carries it (core.md rule 33).
export class FolderCreatedEvent extends DomainEventBase<FolderCreatedData> {
    static readonly EVENT_NAME = 'notes.folder.created' as const;

    constructor(params: FolderEventParams<FolderCreatedData>) {
        super(toFolderDomainEventParams(FolderCreatedEvent.EVENT_NAME, params));
    }
}
