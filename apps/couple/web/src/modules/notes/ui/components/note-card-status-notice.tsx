import { NoteCardStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { Skeleton } from '@cocooning/design-system';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NOTE_CARD_NAMESPACE } from '../../data/note-card-i18n-namespaces';
import type { NoteCardViewModel } from '../../view-models/note-card.view-model';

type Props = {
    readonly card: NoteCardViewModel;
    readonly retry: ReactNode;
};

// R20, R23: what the card says while it is not filled: in search (rule 9: skeletons shaped like its fields), failed
// with a retry, or over the limit of the day.
export function NoteCardStatusNotice({ card, retry }: Props) {
    const { t } = useTranslation(NOTE_CARD_NAMESPACE);
    if (card.status === NoteCardStatusEnum.PENDING) {
        return (
            <div className="flex flex-col gap-3">
                {card.fields.map((field) => (
                    <Skeleton
                        key={field.name}
                        className="h-10 w-full"
                    />
                ))}
                <p className="text-sm text-muted-foreground">
                    {t('line.PENDING')}
                </p>
            </div>
        );
    }
    if (card.status === NoteCardStatusEnum.FAILED) {
        return (
            <div className="flex flex-col items-start gap-2">
                <p className="text-sm">{t('card.failed')}</p>
                {retry}
            </div>
        );
    }
    if (card.status === NoteCardStatusEnum.LIMIT_REACHED) {
        return <p className="text-sm">{t('card.limitReached')}</p>;
    }
    return null;
}
