import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';

type Props = {
    readonly fields: readonly string[];
    readonly onRemove: (index: number) => void;
};

// R17: the fields of a card template, each removed by its « × ».
export function CardFieldChips({ fields, onRemove }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    return (
        <ul className="flex flex-wrap gap-2">
            {fields.map((field, index) => (
                <li
                    key={field}
                    className="inline-flex h-9 items-center gap-1 rounded-full bg-secondary pr-1 pl-3 text-sm font-medium text-foreground"
                >
                    {field}
                    <button
                        type="button"
                        aria-label={t('template.removeField', { name: field })}
                        onClick={() => onRemove(index)}
                        className="flex size-8 items-center justify-center rounded-full text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
                    >
                        <X
                            aria-hidden="true"
                            className="size-4"
                        />
                    </button>
                </li>
            ))}
        </ul>
    );
}
