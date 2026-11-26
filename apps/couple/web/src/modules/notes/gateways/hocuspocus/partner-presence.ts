// R32: each phone on a list shares who reads it in the awareness of Hocuspocus; a state of another partner means they
// are in the list. The awareness lists this phone too, and a second phone of the same partner is not the other one.
export const VIEWER_FIELD = 'viewerId';

type AwarenessState = { readonly [field: string]: unknown };

export const isPartnerPresent = (
    states: readonly AwarenessState[],
    viewerId: string,
): boolean =>
    states.some((state) => {
        const stateViewer = state[VIEWER_FIELD];
        return typeof stateViewer === 'string' && stateViewer !== viewerId;
    });
