import type { ComponentProps } from 'react';
import { cn } from '../utils/cn';

export function Field({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            data-slot="field"
            role="group"
            className={cn('flex flex-col gap-2', className)}
            {...props}
        />
    );
}

// Linked to its input by aria-describedby; renders nothing while the field is valid.
export function FieldError({
    className,
    children,
    ...props
}: ComponentProps<'p'>) {
    if (!children) return null;
    return (
        <p
            data-slot="field-error"
            role="alert"
            className={cn('text-sm text-destructive', className)}
            {...props}
        >
            {children}
        </p>
    );
}
