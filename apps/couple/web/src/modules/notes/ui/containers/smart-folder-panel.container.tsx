'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { noteCardCommandGateway } from '../../gateways';
import { useAddNoteCard } from '../../hooks/use-add-note-card';
import { usePollWhilePending } from '../../hooks/use-poll-while-pending';
import type { NoteCardChoice } from '../../view-models/note-card-choice.view-model';
import { NoteCardAddView } from '../views/note-card-add.view';
import { NoteCardChoiceContainer } from './note-card-choice.container';

type Props = {
    readonly folderId: string;
    readonly hasPendingCard: boolean;
    readonly choices: readonly NoteCardChoice[];
};

// R19, R20: the add box of a smart folder, then the cards in doubt with their candidates; the folder is read again
// while one of its cards is « en recherche ».
export function SmartFolderPanelContainer({
    folderId,
    hasPendingCard,
    choices,
}: Props) {
    const router = useRouter();
    const refresh = useCallback(() => router.refresh(), [router]);
    usePollWhilePending(hasPendingCard, refresh);
    const add = useAddNoteCard(noteCardCommandGateway, folderId);
    return (
        <>
            <NoteCardAddView
                form={add.form}
                isPending={add.isPending}
                onSubmit={add.add}
            />
            {choices.map((choice) => (
                <NoteCardChoiceContainer
                    key={choice.noteId}
                    choice={choice}
                />
            ))}
        </>
    );
}
