'use client';

import { useMemo } from 'react';
import { noteCommandGateway } from '../../gateways';
import { HocuspocusNoteDocumentGateway } from '../../gateways/hocuspocus/hocuspocus-note-document.gateway';
import { useNotePageScreen } from '../../hooks/use-note-page-screen';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { NoteEditorView } from '../views/note-editor.view';
import { NotePageView } from '../views/note-page.view';

type Props = {
    readonly note: NoteListItem;
    readonly collaborationUrl: string;
};

export function NoteContainer({ note, collaborationUrl }: Props) {
    const documentGateway = useMemo(
        () => new HocuspocusNoteDocumentGateway(collaborationUrl),
        [collaborationUrl],
    );
    const screen = useNotePageScreen(
        { commands: noteCommandGateway, document: documentGateway },
        note,
    );
    return (
        <>
            <NotePageView
                note={note}
                form={screen.titleForm}
                isRenaming={screen.isRenaming}
                onRename={screen.renameNote}
            />
            <NoteEditorView editor={screen.editor} />
        </>
    );
}
