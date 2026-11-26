import { useCallback, useState } from 'react';

// Each opening starts a fresh form (the drawer keys its content by `opening`).
export function useNewListSheet() {
    const [isOpen, setIsOpen] = useState(false);
    const [opening, setOpening] = useState(0);
    const open = useCallback(() => {
        setIsOpen(true);
        setOpening((count) => count + 1);
    }, []);
    const close = useCallback(() => setIsOpen(false), []);
    return { isOpen, opening, open, close };
}
