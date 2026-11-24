'use client';

import { cn } from '@cocooning/design-system';
import { Lock } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { MESSAGING_NAMESPACE } from '../../data/messaging-i18n-namespaces';
import {
    type MessageFeedEntry,
    MessageFeedEntryKindEnum,
} from '../../view-models/message-feed.view-model';

const PHOTO_WIDTH = 224;
const PHOTO_HEIGHT = 280;

// R5: mine in terracotta, the partner's in sage; a hidden photo of the day is a placeholder, never its bytes (R9).
export function FeedEntryContent({
    entry,
}: {
    readonly entry: MessageFeedEntry;
}) {
    const { t } = useTranslation(MESSAGING_NAMESPACE);
    if (entry.kind === MessageFeedEntryKindEnum.FLASH_MESSAGE) {
        return (
            <span
                className={cn(
                    'block rounded-2xl px-3.5 py-2.5 text-left text-base leading-snug break-words whitespace-pre-wrap',
                    entry.isOwner
                        ? 'rounded-br-md bg-primary text-primary-foreground'
                        : 'rounded-bl-md bg-secondary text-secondary-foreground',
                )}
            >
                {entry.text}
            </span>
        );
    }
    if (entry.kind === MessageFeedEntryKindEnum.HIDDEN_PHOTO) {
        return (
            <span className="flex h-48 w-56 flex-col items-center justify-center gap-2 rounded-2xl rounded-bl-md bg-secondary px-4 text-center text-sm font-semibold text-secondary-foreground">
                <Lock
                    aria-hidden
                    className="size-5"
                />
                {t('item.hidden')}
            </span>
        );
    }
    return (
        <Image
            src={entry.src}
            alt={t(
                entry.isOwner ? 'item.photoAltMine' : 'item.photoAltPartner',
            )}
            width={PHOTO_WIDTH}
            height={PHOTO_HEIGHT}
            unoptimized
            loading="lazy"
            className={cn(
                'block h-auto max-h-80 w-56 rounded-2xl bg-muted object-cover',
                entry.isOwner ? 'rounded-br-md' : 'rounded-bl-md',
            )}
        />
    );
}
