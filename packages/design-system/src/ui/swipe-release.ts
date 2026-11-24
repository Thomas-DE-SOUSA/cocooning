export const SWIPE_REVEAL_WIDTH = 96;
const DRAG_THRESHOLD = 10;
const FULL_SWIPE_RATIO = 0.6;

export const SwipeReleaseEnum = {
    DELETE: 'DELETE',
    OPEN: 'OPEN',
    CLOSE: 'CLOSE',
} as const;

export type SwipeRelease =
    (typeof SwipeReleaseEnum)[keyof typeof SwipeReleaseEnum];

// null while the finger has barely moved; then a horizontal move drags the row, a vertical one scrolls the page.
export const resolveDragDirection = (
    dx: number,
    dy: number,
): boolean | null => {
    if (Math.max(Math.abs(dx), Math.abs(dy)) < DRAG_THRESHOLD) return null;
    return Math.abs(dx) > Math.abs(dy);
};

// Past most of the row, the release deletes; past half the button, the row stays open on it.
export const resolveSwipeRelease = (
    offset: number,
    rowWidth: number,
): SwipeRelease => {
    if (-offset > rowWidth * FULL_SWIPE_RATIO) return SwipeReleaseEnum.DELETE;
    if (-offset > SWIPE_REVEAL_WIDTH / 2) return SwipeReleaseEnum.OPEN;
    return SwipeReleaseEnum.CLOSE;
};
