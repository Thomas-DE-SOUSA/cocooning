'use client';

import type { ComponentProps } from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { cn } from '../utils/cn';

// A bottom sheet (vaul, on the Radix dialog): dragged down by its handle, or closed by the overlay, Escape or the app.
// On iPhone, Safari already lifts a focused field above the keyboard: vaul lifting the sheet too pushed its top out of
// the screen, and a drag anywhere closed it while the form scrolled.
export function Drawer(props: ComponentProps<typeof DrawerPrimitive.Root>) {
    return (
        <DrawerPrimitive.Root
            data-slot="drawer"
            handleOnly
            repositionInputs={false}
            {...props}
        />
    );
}

export function DrawerContent({
    className,
    children,
    ...props
}: ComponentProps<typeof DrawerPrimitive.Content>) {
    return (
        <DrawerPrimitive.Portal>
            <DrawerPrimitive.Overlay
                data-slot="drawer-overlay"
                className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
            />
            <DrawerPrimitive.Content
                data-slot="drawer-content"
                className={cn(
                    'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)] text-card-foreground shadow-lg outline-none',
                    className,
                )}
                {...props}
            >
                <DrawerPrimitive.Handle
                    data-slot="drawer-handle"
                    className="mt-2 h-1.5! w-10! shrink-0 rounded-full bg-muted-foreground/40! opacity-100!"
                />
                {children}
            </DrawerPrimitive.Content>
        </DrawerPrimitive.Portal>
    );
}

export function DrawerHeader({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            data-slot="drawer-header"
            className={cn('flex items-center gap-2 px-3 py-2', className)}
            {...props}
        />
    );
}

export function DrawerTitle({
    className,
    ...props
}: ComponentProps<typeof DrawerPrimitive.Title>) {
    return (
        <DrawerPrimitive.Title
            data-slot="drawer-title"
            className={cn('text-lg font-semibold', className)}
            {...props}
        />
    );
}

export function DrawerDescription({
    className,
    ...props
}: ComponentProps<typeof DrawerPrimitive.Description>) {
    return (
        <DrawerPrimitive.Description
            data-slot="drawer-description"
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}
