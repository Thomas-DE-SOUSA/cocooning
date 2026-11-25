'use client';

import { Card } from '@cocooning/design-system';
import { Folder } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { presentFolderContents } from '../../presenters/place-labels.presenter';
import type { FolderListItem } from '../../view-models/note-space-screen.view-model';
import { RowActionsButton } from './row-actions-button';
import { RowLink } from './row-link';

type Props = {
    readonly folder: FolderListItem;
    readonly onActions: () => void;
};

// A folder of the screen: its name opens it, its counts tell what it holds (R13), its « ⋯ » acts on it (R14).
export function FolderRow({ folder, onActions }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    return (
        <li>
            <Card className="relative flex items-center gap-3 p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <Folder
                        aria-hidden="true"
                        className="size-5"
                    />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <RowLink href={folder.href}>{folder.name}</RowLink>
                    <p className="text-sm text-muted-foreground">
                        {presentFolderContents(folder, t)}
                    </p>
                </div>
                <RowActionsButton
                    label={t('folder.actions', { name: folder.name })}
                    onClick={onActions}
                />
            </Card>
        </li>
    );
}
