'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { noteCardCommandGateway } from '../../gateways';
import { useAddNoteCard } from '../../hooks/use-add-note-card';
import { usePollWhilePending } from '../../hooks/use-poll-while-pending';
import { NoteCardAddView } from '../views/note-card-add.view';

type Props = {
    readonly folderId: string;
    readonly hasPendingCard: boolean;
};

// R19, R20: the add box of a smart folder; the folder is read again while one of its cards is « en recherche ».
export function SmartFolderPanelContainer({ folderId, hasPendingCard }: Props) {
    const router = useRouter();
    const refresh = useCallback(() => router.refresh(), [router]);
    usePollWhilePending(hasPendingCard, refresh);
    const add = useAddNoteCard(noteCardCommandGateway, folderId);
    return (
        <NoteCardAddView
            form={add.form}
            isPending={add.isPending}
            onSubmit={add.add}
        />
    );
}
