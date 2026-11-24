import type { ResolveSessionUseCase } from '@cocooning/couple-server-business-logic/authentication';
import type {
    AuthorizeNoteDocumentUseCase,
    LoadNoteDocumentUseCase,
    NoteCoupleGuardService,
    SaveNoteDocumentUseCase,
} from '@cocooning/couple-server-business-logic/notes';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { Logger } from '@cocooning/shared-kernel/ports';
import { type HookPayloads, yjs } from '../../esm-packages';
import { reportingFailure } from './hook-failure';
import { readSessionCookie } from './session-cookie';

export type NoteCollaborationUseCases = {
    readonly resolveSession: ResolveSessionUseCase;
    readonly noteCoupleGuard: NoteCoupleGuardService;
    readonly authorize: AuthorizeNoteDocumentUseCase;
    readonly load: LoadNoteDocumentUseCase;
    readonly save: SaveNoteDocumentUseCase;
};

// The document name is the note id. A refused hook closes the connection without saying why (R4).
export function noteCollaborationHooks(
    useCases: NoteCollaborationUseCases,
    logger: Logger,
) {
    return {
        async onAuthenticate({
            requestHeaders,
            documentName,
        }: HookPayloads<ExecutionContext>['authenticate']): Promise<ExecutionContext> {
            return reportingFailure(
                logger,
                'onAuthenticate',
                documentName,
                async () => {
                    const partner = await useCases.resolveSession.execute({
                        sessionToken: readSessionCookie(
                            requestHeaders.get('cookie'),
                        ),
                    });
                    const context =
                        await useCases.noteCoupleGuard.resolveExecutionContext(
                            partner,
                        );
                    await useCases.authorize.execute(context, {
                        noteId: documentName,
                    });
                    return context;
                },
            );
        },
        async onLoadDocument({
            context,
            document,
            documentName,
        }: HookPayloads<ExecutionContext>['loadDocument']): Promise<void> {
            return reportingFailure(
                logger,
                'onLoadDocument',
                documentName,
                async () => {
                    const content = await useCases.load.execute(context, {
                        noteId: documentName,
                    });
                    if (content !== null) yjs.applyUpdate(document, content);
                },
            );
        },
        async onStoreDocument({
            lastContext,
            document,
            documentName,
        }: HookPayloads<ExecutionContext>['storeDocument']): Promise<void> {
            return reportingFailure(
                logger,
                'onStoreDocument',
                documentName,
                () =>
                    useCases.save.execute(lastContext, {
                        noteId: documentName,
                        content: yjs.encodeStateAsUpdate(document),
                    }),
            );
        },
    };
}
