import { cn } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { NOTE_CARD_NAMESPACE } from '../../data/note-card-i18n-namespaces';
import type { NoteCardField } from '../../view-models/note-card.view-model';

type Props = {
    readonly fields: readonly NoteCardField[];
    readonly isBusy: boolean;
    readonly onCorrect: (field: NoteCardField) => void;
};

// R21, R22: each field with its value, « Non trouvé » when none was found; a tap corrects it, « corrigée » marks a
// value written by hand.
export function NoteCardFieldRows({ fields, isBusy, onCorrect }: Props) {
    const { t } = useTranslation(NOTE_CARD_NAMESPACE);
    return (
        <ul className="flex flex-col divide-y divide-border">
            {fields.map((field) => (
                <li key={field.name}>
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onCorrect(field)}
                        className="flex w-full flex-col gap-0.5 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-ring"
                    >
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            {field.name}
                            {field.isManual ? (
                                <span className="text-xs font-semibold text-primary">
                                    {t('card.corrected')}
                                </span>
                            ) : null}
                        </span>
                        <span
                            className={cn(
                                'text-[15px] leading-snug break-words',
                                field.value === null &&
                                    'text-muted-foreground italic',
                            )}
                        >
                            {field.value ?? t('card.notFound')}
                        </span>
                    </button>
                </li>
            ))}
        </ul>
    );
}
