'use client';

import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import { Button } from '@cocooning/design-system';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';

type Props = {
    readonly kind: NoteListKind;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly onAdd: () => void;
};

// Enter or « Ajouter » adds the line and keeps the field focused for the next one: the button never takes the focus,
// so the phone's keyboard stays open.
export function ChecklistAddField({ kind, value, onChange, onAdd }: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    const submit = (event: FormEvent) => {
        event.preventDefault();
        onAdd();
    };
    return (
        <form
            onSubmit={submit}
            className="flex h-12.5 items-center gap-2 rounded-xl border-2 border-primary bg-card pr-1.5 pl-3.5"
        >
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={t(`page.add.${kind}`)}
                aria-label={t(`page.add.${kind}`)}
                autoComplete="off"
                enterKeyHint="send"
                className="h-11 min-w-0 flex-1 bg-transparent text-base placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
                type="submit"
                onPointerDown={(event) => event.preventDefault()}
                className="h-9.5 rounded-lg px-3.5 text-sm"
            >
                {t('page.add.submit')}
            </Button>
        </form>
    );
}
