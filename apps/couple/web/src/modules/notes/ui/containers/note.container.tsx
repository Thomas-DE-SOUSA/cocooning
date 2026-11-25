'use client';

import { useMemo } from 'react';
import { noteCommandGateway } from '../../gateways';
import { HocuspocusNoteDocumentGateway } from '../../gateways/hocuspocus/hocuspocus-note-document.gateway';
import { useNotePageScreen } from '../../hooks/use-note-page-screen';
import { useNoteSheet } from '../../hooks/use-note-sheet';
import type { NotePlaceLevel } from '../../view-models/note-space-screen.view-model';
import { NoteSheetKindEnum } from '../../view-models/note-sheet.view-model';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { NoteEditorView } from '../views/note-editor.view';
import { NotePageView } from '../views/note-page.view';
import { NoteSheetDrawerContainer } from './note-sheet-drawer.container';

type Props = {
    readonly note: NoteListItem;
    readonly level: NotePlaceLevel;
    readonly collaborationUrl: string;
};

// The « ⋯ » of the page opens the same sheet as a row of its folder; once deleted, the note leaves for that folder.
export function NoteContainer({ note, level, collaborationUrl }: Props) {
    const documentGateway = useMemo(
        () => new HocuspocusNoteDocumentGateway(collaborationUrl),
        [collaborationUrl],
    );
    const screen = useNotePageScreen(
        { commands: noteCommandGateway, document: documentGateway },
        note,
    );
    const sheet = useNoteSheet();
    return (
        <>
            <NotePageView
                note={note}
                place={level.place}
                form={screen.titleForm}
                isRenaming={screen.isRenaming}
                onRename={screen.renameNote}
                onActions={() =>
                    sheet.open({
                        kind: NoteSheetKindEnum.NOTE,
                        note,
                        level,
                        exitHref: level.place.href,
                    })
                }
            />
            <NoteEditorView editor={screen.editor} />
            <NoteSheetDrawerContainer
                target={sheet.target}
                isOpen={sheet.isOpen}
                opening={sheet.opening}
                onClose={sheet.close}
                onOpen={sheet.open}
            />
        </>
    );
}
