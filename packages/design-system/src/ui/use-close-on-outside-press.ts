'use client';

import { type RefObject, useEffect } from 'react';

// While active, a press anywhere outside the element calls onClose (a press inside is the element's own).
export function useCloseOnOutsidePress(
    ref: RefObject<HTMLElement | null>,
    isActive: boolean,
    onClose: () => void,
) {
    useEffect(() => {
        if (!isActive) return;
        const closeOutside = (event: PointerEvent) => {
            if (ref.current?.contains(event.target as Node)) return;
            onClose();
        };
        document.addEventListener('pointerdown', closeOutside);
        return () => document.removeEventListener('pointerdown', closeOutside);
    }, [ref, isActive, onClose]);
}
