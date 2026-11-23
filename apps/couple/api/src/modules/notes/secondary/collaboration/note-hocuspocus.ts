import { Injectable } from '@nestjs/common';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { type Hocuspocus, hocuspocusServer } from '../../esm-packages';

// The one Hocuspocus of the API (decision 0040): its hooks are set by NoteCollaborationServer, its connections closed by the provider.
@Injectable()
export class NoteHocuspocus {
    readonly instance: Hocuspocus<ExecutionContext> =
        new hocuspocusServer.Hocuspocus<ExecutionContext>({ quiet: true });
}
