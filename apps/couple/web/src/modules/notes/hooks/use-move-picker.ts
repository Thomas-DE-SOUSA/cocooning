import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { useCallback, useState, useTransition } from 'react';
import type { NoteSpaceContentsGateway } from '../gateways/ports/note-space-contents.gateway';
import { presentPlaceLevel } from '../presenters/place-level.presenter';
import type { NoteLocation } from '../view-models/note-place.view-model';
import type { NotePlaceLevel } from '../view-models/note-space-screen.view-model';

type Options = {
    readonly gateway: NoteSpaceContentsGateway;
    readonly start: NotePlaceLevel;
    readonly onFailed: (error: ApiError) => void;
};

// R10: the picker starts at the level the page read (decision 0036), then reads each place the partner opens; a refused
// reading keeps the level shown.
export function useMovePicker({ gateway, start, onFailed }: Options) {
    const [level, setLevel] = useState(start);
    const [isLoading, startTransition] = useTransition();
    const show = useCallback(
        (location: NoteLocation) =>
            startTransition(async () => {
                const contents = await gateway.getSpaceContents(location);
                if (!contents.success) {
                    onFailed(contents.error);
                    return;
                }
                setLevel(presentPlaceLevel(contents.value));
            }),
        [gateway, onFailed],
    );
    return { level, isLoading, show };
}
