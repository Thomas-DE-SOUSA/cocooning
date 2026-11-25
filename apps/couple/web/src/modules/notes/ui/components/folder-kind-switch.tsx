import {
    type FolderKind,
    FolderKindEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { cn } from '@cocooning/design-system';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';

type Props = {
    readonly kind: FolderKind;
    readonly onChange: (kind: FolderKind) => void;
};

const KINDS = [FolderKindEnum.CLASSIC, FolderKindEnum.SMART] as const;

// R17: « Classique » or « IA », side by side; the one chosen is filled.
export function FolderKindSwitch({ kind, onChange }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    return (
        <div
            role="group"
            aria-label={t('folderKind.label')}
            className="flex rounded-lg border border-border bg-background p-1"
        >
            {KINDS.map((option) => (
                <button
                    key={option}
                    type="button"
                    aria-pressed={option === kind}
                    onClick={() => onChange(option)}
                    className={cn(
                        'flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md text-base font-medium text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring',
                        option === kind &&
                            'bg-primary font-semibold text-primary-foreground',
                    )}
                >
                    {option === FolderKindEnum.SMART ? (
                        <Sparkles
                            aria-hidden="true"
                            className="size-4"
                        />
                    ) : null}
                    {t(`folderKind.${option}`)}
                </button>
            ))}
        </div>
    );
}
