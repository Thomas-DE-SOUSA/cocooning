import { useEffect, useState } from 'react';
import { Doc } from 'yjs';
import type { NoteDocumentGateway } from '../gateways/ports/note-document.gateway';

type Options = {
    readonly gateway: NoteDocumentGateway;
    readonly noteId: string;
    readonly onLost: () => void;
};

// One Yjs document for the page: a reconnection merges what was typed meanwhile instead of starting over (R6).
export function useNoteDocument({ gateway, noteId, onLost }: Options): Doc {
    const [document] = useState(() => new Doc());
    const [connection, setConnection] = useState(0);
    useEffect(
        () =>
            gateway.connect(
                noteId,
                document,
                {
                    onRefused: onLost,
                    onClosedByServer: () => {
                        onLost();
                        setConnection((count) => count + 1);
                    },
                },
                null,
            ),
        [gateway, noteId, document, onLost, connection],
    );
    return document;
}
