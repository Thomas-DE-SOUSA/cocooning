import { NoteCardStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { Badge, Skeleton } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { NOTE_CARD_NAMESPACE } from '../../data/note-card-i18n-namespaces';
import type { NoteCardLine } from '../../view-models/note-card-line.view-model';

type Props = { readonly card: NoteCardLine };

// R20, R21, R23: under the name of an item, its first values once filled, or where its search is.
export function NoteCardStatusLine({ card }: Props) {
    const { t } = useTranslation(NOTE_CARD_NAMESPACE);
    if (card.status === NoteCardStatusEnum.FILLED) {
        return (
            <p className="text-sm break-words text-muted-foreground">
                {card.summary ?? t('line.nothingFound')}
            </p>
        );
    }
    if (card.status === NoteCardStatusEnum.CHOOSING) {
        return (
            <Badge className="w-fit rounded-full bg-primary/15 text-primary">
                {t('line.CHOOSING')}
            </Badge>
        );
    }
    return (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
            {card.status === NoteCardStatusEnum.PENDING ? (
                <Skeleton className="h-2.5 w-16 rounded-md" />
            ) : null}
            {t(`line.${card.status}`)}
        </p>
    );
}
