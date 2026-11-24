'use client';

import { Badge } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import type { Namespace } from '@/i18n/resources';

type Props = {
    readonly namespace: Namespace;
    readonly isShared: boolean;
};

// Shared in sage, private in outline: the two states differ by more than their color (platform decision 0017).
export function NoteVisibilityBadge({ namespace, isShared }: Props) {
    const { t } = useTranslation(namespace);
    return (
        <Badge variant={isShared ? 'secondary' : 'outline'}>
            {t(isShared ? 'note.shared' : 'note.private')}
        </Badge>
    );
}
