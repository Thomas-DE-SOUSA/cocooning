'use client';

import type {
    ChecklistLine,
    ViewerChecker,
} from '@cocooning/couple-client-business-logic/notes';
import { cn, SwipeToDelete } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';
import { ChecklistBox } from './checklist-box';
import { ChecklistLineEditor } from './checklist-line-editor';

type Props = {
    readonly line: ChecklistLine;
    // Who checked a line of « Fait », seen by the reader; null for an open line.
    readonly checker: ViewerChecker | null;
    readonly isEditing: boolean;
    readonly onToggle: () => void;
    readonly onStartEdit: () => void;
    readonly onRename: (text: string) => void;
    readonly onStopEdit: () => void;
    readonly onRemove: () => void;
};

// R29, R30: the box checks or unchecks, the text edits in place, a swipe to the left removes the line (decision 0049).
export function ChecklistLineRow({
    line,
    checker,
    isEditing,
    onToggle,
    onStartEdit,
    onRename,
    onStopEdit,
    onRemove,
}: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    return (
        <li className="border-t border-border first:border-t-0">
            <SwipeToDelete
                label={t('page.line.delete')}
                onDelete={onRemove}
                isRemoved={false}
                disabled={isEditing}
                className="rounded-none"
            >
                <div className="flex min-h-12.5 items-center gap-1 bg-card pr-3.5 pl-1">
                    <button
                        type="button"
                        role="checkbox"
                        aria-checked={line.checked}
                        aria-label={line.text}
                        onClick={onToggle}
                        className="flex size-11 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
                    >
                        <ChecklistBox
                            checked={line.checked}
                            checker={checker}
                        />
                    </button>
                    {isEditing ? (
                        <ChecklistLineEditor
                            text={line.text}
                            label={t('page.line.editLabel')}
                            onSave={onRename}
                            onCancel={onStopEdit}
                        />
                    ) : (
                        <button
                            type="button"
                            aria-label={t('page.line.edit', {
                                text: line.text,
                            })}
                            onClick={onStartEdit}
                            className={cn(
                                'min-h-11 min-w-0 flex-1 py-2 text-left text-base break-words',
                                line.checked &&
                                    'text-muted-foreground line-through',
                            )}
                        >
                            {line.text}
                        </button>
                    )}
                    {checker === null ? null : (
                        <span className="text-xs font-semibold text-muted-foreground">
                            {t(`page.line.checker.${checker}`)}
                        </span>
                    )}
                </div>
            </SwipeToDelete>
        </li>
    );
}
