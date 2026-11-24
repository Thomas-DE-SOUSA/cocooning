'use client';

import { Trash2 } from 'lucide-react';
import { type ReactNode, useRef } from 'react';
import { cn } from '../utils/cn';
import { SWIPE_REVEAL_WIDTH } from './swipe-release';
import { useSwipeToDelete } from './use-swipe-to-delete';

type Props = {
    readonly label: string;
    readonly onDelete: () => void;
    readonly isRemoved: boolean;
    readonly disabled: boolean;
    readonly className?: string;
    readonly children: ReactNode;
};

const actionWidthOf = (offset: number, isRemoved: boolean): string => {
    if (isRemoved) return '100%';
    return `${Math.max(SWIPE_REVEAL_WIDTH, -offset)}px`;
};

// A row slid to the left shows a delete button behind it (vertical scrolling stays the browser's); the app removes it with isRemoved.
export function SwipeToDelete({
    label,
    onDelete,
    isRemoved,
    disabled,
    className,
    children,
}: Props) {
    const rowRef = useRef<HTMLDivElement>(null);
    const swipe = useSwipeToDelete({ rowRef, onDelete, disabled });
    const isRevealed = isRemoved || swipe.offset < 0;
    return (
        <div
            ref={rowRef}
            data-slot="swipe-to-delete"
            className={cn('relative overflow-hidden rounded-2xl', className)}
        >
            {isRevealed ? (
                <button
                    type="button"
                    inert={!swipe.isOpen}
                    onClick={onDelete}
                    style={{ width: actionWidthOf(swipe.offset, isRemoved) }}
                    className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-1 rounded-2xl bg-destructive text-sm font-semibold text-destructive-foreground"
                >
                    <Trash2
                        aria-hidden
                        className="size-5"
                    />
                    {label}
                </button>
            ) : null}
            <div
                data-slot="swipe-to-delete-row"
                {...swipe.handlers}
                style={{
                    transform: isRemoved
                        ? 'translateX(-100%)'
                        : `translateX(${swipe.offset}px)`,
                }}
                className={cn(
                    'relative touch-pan-y',
                    !swipe.isDragging &&
                        'transition-transform duration-200 ease-out motion-reduce:transition-none',
                )}
            >
                {children}
            </div>
        </div>
    );
}
