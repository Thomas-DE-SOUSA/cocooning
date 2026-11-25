'use client';

import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import { cn } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';

type Props = {
    readonly spaces: readonly NoteSpace[];
    readonly current: NoteSpace;
    readonly disabled: boolean;
    readonly onChoose: (space: NoteSpace) => void;
};

// R11: « Partagé » or « Privé » for a note of its owner; the chosen one is filled, not only colored.
export function SpaceSwitch({ spaces, current, disabled, onChoose }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    return (
        <div
            role="group"
            aria-label={t('move.spaces')}
            className="flex rounded-xl border border-border bg-background p-1"
        >
            {spaces.map((space) => (
                <button
                    key={space}
                    type="button"
                    aria-pressed={space === current}
                    disabled={disabled}
                    onClick={() => {
                        if (space !== current) onChoose(space);
                    }}
                    className={cn(
                        'h-10 flex-1 rounded-lg text-base font-medium text-muted-foreground disabled:opacity-50',
                        space === current &&
                            'bg-primary font-semibold text-primary-foreground',
                    )}
                >
                    {t(`spaces.${space}.name`)}
                </button>
            ))}
        </div>
    );
}
