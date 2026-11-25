'use client';

import { NoteCardStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { Card } from '@cocooning/design-system';
import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CommandButton } from '@/shared/ui/command-button';
import { NOTE_CARD_NAMESPACE } from '../../data/note-card-i18n-namespaces';
import {
    type NoteCardCommand,
    NoteCardCommandEnum,
} from '../../view-models/note-card-command.view-model';
import type {
    NoteCardField,
    NoteCardViewModel,
} from '../../view-models/note-card.view-model';
import { NoteCardFieldRows } from '../components/note-card-field-rows';
import { NoteCardSources } from '../components/note-card-sources';
import { NoteCardStatusNotice } from '../components/note-card-status-notice';

type Props = {
    readonly card: NoteCardViewModel;
    readonly pending: NoteCardCommand | null;
    readonly isBusy: boolean;
    readonly onRefresh: () => void;
    readonly onCorrect: (field: NoteCardField) => void;
    // R19: « Lequel ? » under the card while it waits for a candidate.
    readonly children: ReactNode;
};

const HEADING_ID = 'note-card-heading';

const showsFields = (card: NoteCardViewModel): boolean =>
    card.searchedOn !== null &&
    card.status !== NoteCardStatusEnum.PENDING &&
    card.status !== NoteCardStatusEnum.CHOOSING;

// R20 to R22, R25: the card at the top of a note, then « Nos notes », written by both as in any note.
export function NoteCardView({
    card,
    pending,
    isBusy,
    onRefresh,
    onCorrect,
    children,
}: Props) {
    const { t } = useTranslation(NOTE_CARD_NAMESPACE);
    const refreshButton = (label: string) =>
        card.canRefresh ? (
            <CommandButton
                variant="outline"
                label={label}
                pendingLabel={t('card.refreshing')}
                isPending={pending === NoteCardCommandEnum.REFRESH}
                isBusy={isBusy || card.status === NoteCardStatusEnum.PENDING}
                onClick={onRefresh}
            />
        ) : null;
    return (
        <>
            <section aria-labelledby={HEADING_ID}>
                <Card className="flex flex-col gap-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                        <h2
                            id={HEADING_ID}
                            className="flex items-center gap-1.5 font-sans text-sm font-semibold text-primary"
                        >
                            <Sparkles
                                aria-hidden="true"
                                className="size-4"
                            />
                            {t('card.title')}
                        </h2>
                        {refreshButton(t('card.refresh'))}
                    </div>
                    <NoteCardStatusNotice
                        card={card}
                        retry={refreshButton(t('card.retry'))}
                    />
                    {showsFields(card) ? (
                        <NoteCardFieldRows
                            fields={card.fields}
                            isBusy={isBusy}
                            onCorrect={onCorrect}
                        />
                    ) : null}
                    {card.searchedOn === null ? null : (
                        <NoteCardSources
                            sources={card.sources}
                            searchedOn={card.searchedOn}
                        />
                    )}
                </Card>
            </section>
            {children}
            <h2 className="px-1 font-sans text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {t('card.ourNotes')}
            </h2>
        </>
    );
}
