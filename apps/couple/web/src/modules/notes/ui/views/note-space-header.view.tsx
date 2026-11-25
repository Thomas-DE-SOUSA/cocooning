'use client';

import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { presentPlaceName } from '../../presenters/place-labels.presenter';
import type { NotePlace } from '../../view-models/note-place.view-model';
import { BackLink } from '../components/back-link';

type Props = {
    readonly place: NotePlace;
    readonly back: NotePlace | null;
};

// The way back to the level above (the home of the notes above a space), the name of the place, and who sees a space.
export function NoteSpaceHeaderView({ place, back }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    return (
        <header className="flex flex-col gap-1">
            <BackLink
                href={back === null ? WebRouterEnum.HOME : back.href}
                label={
                    back === null ? t('back.home') : presentPlaceName(back, t)
                }
            />
            <h1 className="text-3xl font-semibold break-words">
                {presentPlaceName(place, t)}
            </h1>
            {place.folder === null ? (
                <p className="text-sm text-muted-foreground">
                    {t(`spaces.${place.space}.subtitle`)}
                </p>
            ) : null}
        </header>
    );
}
