'use client';

import { Drawer, DrawerContent } from '@cocooning/design-system';
import { useMemo } from 'react';
import { lineIdGenerator } from '../../gateways';
import { HocuspocusNoteDocumentGateway } from '../../gateways/hocuspocus/hocuspocus-note-document.gateway';
import { useNoteListScreen } from '../../hooks/use-note-list-screen';
import { useNoteListSheet } from '../../hooks/use-note-list-sheet';
import type { NoteListViewModel } from '../../view-models/note-list-page.view-model';
import { ChecklistView } from '../views/checklist.view';
import { ClearDoneSheetView } from '../views/clear-done-sheet.view';
import { NoteListHeaderView } from '../views/note-list-header.view';
import { NoteListSheetContainer } from './note-list-sheet.container';

type Props = {
    readonly list: NoteListViewModel;
    readonly collaborationUrl: string;
};

// R29 to R32: the lines are written in the shared document, so both phones see each change at once.
export function NoteListContainer({ list, collaborationUrl }: Props) {
    const documentGateway = useMemo(
        () => new HocuspocusNoteDocumentGateway(collaborationUrl),
        [collaborationUrl],
    );
    const { screen, actions, clear, isPartnerHere } = useNoteListScreen(
        { document: documentGateway, lineIds: lineIdGenerator },
        list,
    );
    const sheet = useNoteListSheet();
    return (
        <>
            <NoteListHeaderView
                list={list}
                isPartnerHere={isPartnerHere}
                onActions={sheet.open}
            />
            <ChecklistView
                kind={list.kind}
                screen={screen}
                actions={actions}
            />
            <Drawer
                open={clear.isOpen}
                onOpenChange={(open) => {
                    if (!open) clear.keep();
                }}
            >
                <DrawerContent>
                    <ClearDoneSheetView
                        count={clear.count}
                        onConfirm={clear.confirm}
                        onKeep={clear.keep}
                    />
                </DrawerContent>
            </Drawer>
            <NoteListSheetContainer
                list={list}
                isOpen={sheet.isOpen}
                step={sheet.step}
                opening={sheet.opening}
                onGoTo={sheet.goTo}
                onClose={sheet.close}
            />
        </>
    );
}
