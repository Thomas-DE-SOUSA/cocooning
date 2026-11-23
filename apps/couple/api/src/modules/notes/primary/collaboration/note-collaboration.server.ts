import {
    type BeforeApplicationShutdown,
    Injectable,
    type OnApplicationBootstrap,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Server } from 'node:http';
import { ResolveSessionUseCase } from '@cocooning/couple-server-business-logic/authentication';
import {
    AuthorizeNoteDocumentUseCase,
    LoadNoteDocumentUseCase,
    NoteCoupleGuardService,
    SaveNoteDocumentUseCase,
} from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { Logger } from '@cocooning/shared-kernel/ports';
import type { WebSocketServer } from 'ws';
import { NoteHocuspocus } from '../../secondary/collaboration';
import { noteCollaborationHooks } from './note-collaboration.hooks';
import { bridgeWebSockets } from './websocket-bridge';

// Primary adapter of the real-time channel (decision 0040): WebSockets on ApiRouterEnum.NOTE_COLLABORATION of the API's own server.
@Injectable()
export class NoteCollaborationServer
    implements OnApplicationBootstrap, BeforeApplicationShutdown
{
    private sockets: WebSocketServer | null = null;

    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        private readonly noteHocuspocus: NoteHocuspocus,
        private readonly resolveSession: ResolveSessionUseCase,
        private readonly noteCoupleGuard: NoteCoupleGuardService,
        private readonly authorize: AuthorizeNoteDocumentUseCase,
        private readonly load: LoadNoteDocumentUseCase,
        private readonly save: SaveNoteDocumentUseCase,
        private readonly logger: Logger,
    ) {
        this.logger.setContext(NoteCollaborationServer.name);
    }

    onApplicationBootstrap(): void {
        const hocuspocus = this.noteHocuspocus.instance;
        hocuspocus.configure({
            extensions: [
                noteCollaborationHooks(
                    {
                        resolveSession: this.resolveSession,
                        noteCoupleGuard: this.noteCoupleGuard,
                        authorize: this.authorize,
                        load: this.load,
                        save: this.save,
                    },
                    this.logger,
                ),
            ],
        });
        this.sockets = bridgeWebSockets(
            this.httpAdapterHost.httpAdapter.getHttpServer() as Server,
            ApiRouterEnum.NOTE_COLLABORATION,
            hocuspocus,
        );
    }

    // Before the HTTP server closes, which waits for open sockets: pending stores are written, nothing typed is lost.
    beforeApplicationShutdown(): void {
        this.noteHocuspocus.instance.flushPendingStores();
        this.sockets?.clients.forEach((client) => client.terminate());
        this.sockets?.close();
    }
}
