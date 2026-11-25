'use client';

import { Skeleton } from '@cocooning/design-system';
import { ChevronRight, Folder } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { presentFolderContents } from '../../presenters/place-labels.presenter';
import type { FolderListItem } from '../../view-models/note-space-screen.view-model';
import { SmartBadge } from './smart-badge';

type Props = {
    readonly folders: readonly FolderListItem[];
    readonly isLoading: boolean;
    readonly onOpen: (folder: FolderListItem) => void;
};

// The folders of the level shown in the move picker, each opened by a tap; skeletons while a level is read (rule 9).
export function PickerFolders({ folders, isLoading, onOpen }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    if (isLoading) {
        return (
            <div className="flex flex-col gap-2">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
        );
    }
    if (folders.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                {t('move.noFolder')}
            </p>
        );
    }
    return (
        <ul className="flex flex-col gap-2">
            {folders.map((folder) => (
                <li key={folder.folderId}>
                    <button
                        type="button"
                        onClick={() => onOpen(folder)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left focus-visible:outline-2 focus-visible:outline-ring"
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                            <Folder
                                aria-hidden="true"
                                className="size-5"
                            />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="flex items-center gap-2 font-semibold break-words">
                                {folder.name}
                                {folder.isSmart ? (
                                    <SmartBadge label={t('smartBadge')} />
                                ) : null}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {presentFolderContents(folder, t)}
                            </span>
                        </span>
                        <ChevronRight
                            aria-hidden="true"
                            className="size-5 text-muted-foreground"
                        />
                    </button>
                </li>
            ))}
        </ul>
    );
}
