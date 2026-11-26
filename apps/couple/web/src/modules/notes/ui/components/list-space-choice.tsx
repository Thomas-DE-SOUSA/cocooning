'use client';

import {
    type NoteSpace,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { cn } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';

type Props = {
    readonly current: NoteSpace;
    readonly disabled: boolean;
    readonly onChoose: (space: NoteSpace) => void;
};

// R26: « Commune » or « Rien que pour moi »; the chosen one is filled, not only coloured.
export function ListSpaceChoice({ current, disabled, onChoose }: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    return (
        <div
            role="group"
            aria-label={t('spaces.label')}
            className="flex rounded-xl border border-border bg-background p-1"
        >
            {Object.values(NoteSpaceEnum).map((space) => (
                <button
                    key={space}
                    type="button"
                    aria-pressed={space === current}
                    disabled={disabled}
                    onClick={() => onChoose(space)}
                    className={cn(
                        'h-11 flex-1 rounded-lg text-base font-medium text-muted-foreground disabled:opacity-50',
                        space === current &&
                            'bg-primary font-semibold text-primary-foreground',
                    )}
                >
                    {t(`spaces.${space}`)}
                </button>
            ))}
        </div>
    );
}
