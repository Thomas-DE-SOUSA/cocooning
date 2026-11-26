import { useEffect, useState } from 'react';
import { Doc } from 'yjs';
import type { NoteDocumentGateway } from '../gateways/ports/note-document.gateway';

type Options = {
    readonly gateway: NoteDocumentGateway;
    readonly noteId: string;
    readonly onLost: () => void;
};

// The document of a list, kept for the page like the one of a note (R6); its lines are known once first synced.
export function useListDocument({ gateway, noteId, onLost }: Options) {
    const [document] = useState(() => new Doc());
    const [connection, setConnection] = useState(0);
    const [isSynced, setIsSynced] = useState(false);
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
                { onSynced: () => setIsSynced(true) },
            ),
        [gateway, noteId, document, onLost, connection],
    );
    return { document, isSynced };
}
