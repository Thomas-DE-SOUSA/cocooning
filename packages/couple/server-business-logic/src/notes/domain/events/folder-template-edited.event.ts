import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type FolderEventParams,
    toFolderDomainEventParams,
} from './folder-event-params';

// The subject and the fields belong to the couple: the event carries none of them (core.md rule 33).
export class FolderTemplateEditedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'notes.folder.template-edited' as const;

    constructor(params: FolderEventParams<null>) {
        super(
            toFolderDomainEventParams(
                FolderTemplateEditedEvent.EVENT_NAME,
                params,
            ),
        );
    }
}
