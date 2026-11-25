'use client';

import { Button, Card } from '@cocooning/design-system';
import { Camera, CircleCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MESSAGING_NAMESPACE } from '../../data/messaging-i18n-namespaces';
import {
    type PhotoPromptCard,
    PhotoPromptCardStatusEnum,
} from '../../view-models/photo-prompt-card.view-model';

type Props = {
    readonly card: PhotoPromptCard;
    readonly isBusy: boolean;
    readonly onTakePhoto: (photoPromptId: string) => void;
};

// R8, R9: today's prompt while I have not answered; once answered, a discreet line.
export function PhotoPromptCardView({ card, isBusy, onTakePhoto }: Props) {
    const { t } = useTranslation(MESSAGING_NAMESPACE);
    if (card.status === PhotoPromptCardStatusEnum.ANSWERED) {
        return (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CircleCheck
                    aria-hidden
                    className="size-4"
                />
                {t(
                    card.isAnsweredByPartner
                        ? 'prompt.bothAnswered'
                        : 'prompt.answered',
                )}
            </p>
        );
    }
    return (
        <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-xl font-semibold">{t('prompt.title')}</h2>
                <span className="text-sm font-semibold text-primary">
                    {t('prompt.issuedAt', { time: card.issuedAt })}
                </span>
            </div>
            <p className="text-sm text-muted-foreground">
                {card.minutesBeforeLate === null
                    ? t('prompt.late')
                    : t('prompt.beforeLate', {
                          minutes: card.minutesBeforeLate,
                      })}
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full bg-secondary-foreground"
                />
                {t(
                    card.isAnsweredByPartner
                        ? 'prompt.partnerAnswered'
                        : 'prompt.partnerWaiting',
                )}
            </p>
            <Button
                className="h-12 text-base"
                disabled={isBusy}
                onClick={() => onTakePhoto(card.photoPromptId)}
            >
                <Camera
                    aria-hidden
                    className="size-5"
                />
                {t('prompt.take')}
            </Button>
        </Card>
    );
}
