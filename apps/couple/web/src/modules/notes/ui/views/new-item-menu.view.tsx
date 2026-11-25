'use client';

import { Button, cn } from '@cocooning/design-system';
import { FileText, Folder, Plus } from 'lucide-react';
import type { KeyboardEvent, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';

type Props = {
    readonly menuRef: RefObject<HTMLDivElement | null>;
    readonly isOpen: boolean;
    readonly onToggle: () => void;
    readonly onClose: () => void;
    readonly onNewNote: () => void;
    readonly onNewFolder: () => void;
};

const MENU_ID = 'new-item-menu';
const ITEM_CLASS =
    'flex h-13 w-full items-center gap-3 px-4 text-left text-base font-medium hover:bg-muted focus-visible:bg-muted focus-visible:outline-none';

// R13: the « + » above the tab bar creates a note or a folder where the partner is (decision 0053).
export function NewItemMenuView({
    menuRef,
    isOpen,
    onToggle,
    onClose,
    onNewNote,
    onNewFolder,
}: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const closeOnEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
    };
    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10">
            <div
                ref={menuRef}
                onKeyDown={closeOnEscape}
                className="mx-auto flex max-w-lg flex-col items-end gap-3 px-5"
            >
                {isOpen ? (
                    <ul
                        id={MENU_ID}
                        className="pointer-events-auto w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
                    >
                        <li>
                            <button
                                type="button"
                                className={ITEM_CLASS}
                                onClick={onNewNote}
                            >
                                <FileText
                                    aria-hidden="true"
                                    className="size-5"
                                />
                                {t('add.note')}
                            </button>
                        </li>
                        <li className="border-t border-border">
                            <button
                                type="button"
                                className={ITEM_CLASS}
                                onClick={onNewFolder}
                            >
                                <Folder
                                    aria-hidden="true"
                                    className="size-5"
                                />
                                {t('add.folder')}
                            </button>
                        </li>
                    </ul>
                ) : null}
                <Button
                    aria-label={t('add.label')}
                    aria-expanded={isOpen}
                    aria-controls={MENU_ID}
                    onClick={onToggle}
                    className="pointer-events-auto size-14 rounded-full px-0 shadow-lg"
                >
                    <Plus
                        aria-hidden="true"
                        className={cn(
                            'size-6 transition-transform',
                            isOpen && 'rotate-45',
                        )}
                    />
                </Button>
            </div>
        </div>
    );
}
