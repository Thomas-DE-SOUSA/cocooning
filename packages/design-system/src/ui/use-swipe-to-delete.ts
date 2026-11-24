'use client';

import {
    type MouseEvent,
    type PointerEvent,
    type RefObject,
    useCallback,
    useRef,
    useState,
} from 'react';
import {
    resolveDragDirection,
    resolveSwipeRelease,
    SWIPE_REVEAL_WIDTH,
    SwipeReleaseEnum,
} from './swipe-release';
import { useCloseOnOutsidePress } from './use-close-on-outside-press';

type Drag = {
    readonly startX: number;
    readonly startY: number;
    readonly base: number;
    readonly isHorizontal: boolean | null;
};

type Options = {
    readonly rowRef: RefObject<HTMLDivElement | null>;
    readonly onDelete: () => void;
    readonly disabled: boolean;
};

// A row slid to the left: past half the button it stays open, past most of the row it deletes on release.
export function useSwipeToDelete({ rowRef, onDelete, disabled }: Options) {
    const dragRef = useRef<Drag | null>(null);
    const hasDraggedRef = useRef(false);
    const [offset, setOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const isOpen = offset === -SWIPE_REVEAL_WIDTH && !isDragging;

    const close = useCallback(() => setOffset(0), []);
    useCloseOnOutsidePress(rowRef, isOpen, close);

    const startDrag = (start: Drag, event: PointerEvent<HTMLDivElement>) => {
        const isHorizontal = resolveDragDirection(
            event.clientX - start.startX,
            event.clientY - start.startY,
        );
        if (isHorizontal === null) return;
        dragRef.current = isHorizontal ? { ...start, isHorizontal } : null;
        if (!isHorizontal) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        hasDraggedRef.current = true;
        setIsDragging(true);
    };

    const settle = () => {
        const release = resolveSwipeRelease(
            offset,
            rowRef.current?.offsetWidth ?? 0,
        );
        setOffset(release === SwipeReleaseEnum.OPEN ? -SWIPE_REVEAL_WIDTH : 0);
        if (release === SwipeReleaseEnum.DELETE) onDelete();
    };

    const endDrag = () => {
        const wasHorizontal = dragRef.current?.isHorizontal === true;
        dragRef.current = null;
        if (!wasHorizontal) return;
        setIsDragging(false);
        settle();
    };

    return {
        offset,
        isOpen,
        isDragging,
        handlers: {
            onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
                if (disabled) return;
                hasDraggedRef.current = false;
                dragRef.current = {
                    startX: event.clientX,
                    startY: event.clientY,
                    base: offset,
                    isHorizontal: null,
                };
            },
            onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
                const current = dragRef.current;
                if (current === null) return;
                if (current.isHorizontal === null) {
                    startDrag(current, event);
                    return;
                }
                setOffset(
                    Math.min(0, current.base + event.clientX - current.startX),
                );
            },
            onPointerUp: endDrag,
            onPointerCancel: endDrag,
            // The click that ends a drag, or a tap on an open row (which closes it), never reaches the row's own button.
            onClickCapture: (event: MouseEvent<HTMLDivElement>) => {
                if (!hasDraggedRef.current && !isOpen) return;
                event.preventDefault();
                event.stopPropagation();
                if (!hasDraggedRef.current) close();
                hasDraggedRef.current = false;
            },
        },
    };
}
