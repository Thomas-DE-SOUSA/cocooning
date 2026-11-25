import { useCloseOnOutsidePress } from '@cocooning/design-system';
import { useCallback, useRef, useState } from 'react';

// The small menu of the « + » button: a press outside it closes it, like Escape in the view.
export function useNewItemMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setIsOpen(false), []);
    useCloseOnOutsidePress(menuRef, isOpen, close);
    return {
        isOpen,
        menuRef,
        toggle: () => setIsOpen((open) => !open),
        close,
    };
}
