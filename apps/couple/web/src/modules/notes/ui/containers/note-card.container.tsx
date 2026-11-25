'use client';

import { Drawer, DrawerContent } from '@cocooning/design-system';
import { noteCardCommandGateway } from '../../gateways';
import { useNoteCardPanel } from '../../hooks/use-note-card-panel';
import { NoteCardCommandEnum } from '../../view-models/note-card-command.view-model';
import type { NoteCardViewModel } from '../../view-models/note-card.view-model';
import { NoteCardFieldSheetView } from '../views/note-card-field-sheet.view';
import { NoteCardView } from '../views/note-card.view';
import { NoteCardChoiceContainer } from './note-card-choice.container';

type Props = { readonly card: NoteCardViewModel };

// The card of a note, « Lequel ? » while it is in doubt, and the sheet that corrects one field (R19 to R22).
export function NoteCardContainer({ card }: Props) {
    const panel = useNoteCardPanel(noteCardCommandGateway, card);
    return (
        <>
            <NoteCardView
                card={card}
                pending={panel.pending}
                isBusy={panel.isBusy}
                onRefresh={panel.refreshCard}
                onCorrect={panel.openCorrection}
            >
                {card.choice === null ? null : (
                    <NoteCardChoiceContainer choice={card.choice} />
                )}
            </NoteCardView>
            <Drawer
                open={panel.isCorrectionOpen}
                onOpenChange={(open) => {
                    if (!open) panel.closeCorrection();
                }}
            >
                <DrawerContent>
                    {panel.correcting === null ? null : (
                        <NoteCardFieldSheetView
                            key={panel.correcting.name}
                            field={panel.correcting}
                            form={panel.form}
                            isPending={
                                panel.pending === NoteCardCommandEnum.CORRECT
                            }
                            isBusy={panel.isBusy}
                            onSubmit={panel.correct}
                        />
                    )}
                </DrawerContent>
            </Drawer>
        </>
    );
}
