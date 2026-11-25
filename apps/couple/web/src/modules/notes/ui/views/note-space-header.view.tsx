'use client';

import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { presentPlaceName } from '../../presenters/place-labels.presenter';
import type { NoteCardContext } from '../../view-models/note-card-context.view-model';
import type { NotePlace } from '../../view-models/note-place.view-model';
import { BackLink } from '../components/back-link';
import { SmartBadge } from '../components/smart-badge';

type Props = {
    readonly place: NotePlace;
    readonly back: NotePlace | null;
    readonly cardContext: NoteCardContext | null;
};

// The way back to the level above (the home of the notes above a space), the name of the place, and who sees a space;
// a smart folder shows « IA » and its subject, a sub-folder the smart folder whose card it keeps (R17, R18).
export function NoteSpaceHeaderView({ place, back, cardContext }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    return (
        <header className="flex flex-col gap-1">
            <BackLink
                href={back === null ? WebRouterEnum.HOME : back.href}
                label={
                    back === null ? t('back.home') : presentPlaceName(back, t)
                }
            />
            <h1 className="flex flex-wrap items-center gap-2 text-3xl font-semibold break-words">
                {presentPlaceName(place, t)}
                {cardContext === null ? null : (
                    <SmartBadge label={t('smartBadge')} />
                )}
            </h1>
            {cardContext === null ? null : (
                <p className="text-sm break-words text-muted-foreground">
                    {cardContext.isInherited
                        ? t('smart.inherited', { name: cardContext.holderName })
                        : cardContext.subject}
                </p>
            )}
            {place.folder === null ? (
                <p className="text-sm text-muted-foreground">
                    {t(`spaces.${place.space}.subtitle`)}
                </p>
            ) : null}
        </header>
    );
}
