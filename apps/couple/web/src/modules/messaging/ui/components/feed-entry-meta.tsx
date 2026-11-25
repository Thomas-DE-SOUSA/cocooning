'use client';

import { useTranslation } from 'react-i18next';
import { MESSAGING_NAMESPACE } from '../../data/messaging-i18n-namespaces';
import {
    type MessageFeedEntry,
    MessageFeedEntryKindEnum,
} from '../../view-models/message-feed.view-model';

// "14:40, photo du jour, en retard" (R5, R8): the Paris time, then what the photo answered.
export function FeedEntryMeta({ entry }: { readonly entry: MessageFeedEntry }) {
    const { t } = useTranslation(MESSAGING_NAMESPACE);
    const parts = [entry.time];
    if (entry.kind === MessageFeedEntryKindEnum.INSTANT_PHOTO) {
        if (entry.isPhotoOfTheDay) parts.push(t('item.photoOfTheDay'));
        if (entry.isLate) parts.push(t('item.late'));
    }
    return (
        <span className="px-1 text-xs text-muted-foreground">
            {parts.join(', ')}
        </span>
    );
}
