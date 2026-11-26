'use client';

import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import { Button, Skeleton } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';
import type {
    ChecklistActions,
    ChecklistScreen,
} from '../../view-models/checklist-screen.view-model';
import { ChecklistAddField } from '../components/checklist-add-field';
import { ChecklistLines } from '../components/checklist-lines';

type Props = {
    readonly kind: NoteListKind;
    readonly screen: ChecklistScreen;
    readonly actions: ChecklistActions;
};

// R30: the lines left to check on top, then « Fait », each part in the order of the document.
export function ChecklistView({ kind, screen, actions }: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    const { open, done } = screen;
    return (
        <>
            <ChecklistAddField
                kind={kind}
                value={screen.draft}
                onChange={actions.onDraftChange}
                onAdd={actions.onAdd}
            />
            {!screen.isSynced ? (
                <Skeleton className="h-37.5 w-full rounded-2xl" />
            ) : null}
            {screen.isSynced && open.length + done.length === 0 ? (
                <p className="mx-1 text-muted-foreground">
                    {t(`page.empty.${kind}`)}
                </p>
            ) : null}
            <ChecklistLines
                rows={open.map((line) => ({ line, checker: null }))}
                editingLineId={screen.editingLineId}
                actions={actions}
            />
            {done.length === 0 ? null : (
                <section className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
                            {t('page.done.title', { count: done.length })}
                        </h2>
                        <Button
                            variant="ghost"
                            onClick={actions.onAskClear}
                            className="font-semibold text-primary"
                        >
                            {t('page.done.clear')}
                        </Button>
                    </div>
                    <ChecklistLines
                        rows={done.map((line) => ({
                            line,
                            checker: line.checkedByViewer,
                        }))}
                        editingLineId={screen.editingLineId}
                        actions={actions}
                    />
                </section>
            )}
        </>
    );
}
