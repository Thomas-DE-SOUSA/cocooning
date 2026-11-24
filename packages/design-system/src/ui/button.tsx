import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../utils/cn';

const buttonVariants = cva(
    'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary:
                    'bg-primary text-primary-foreground hover:bg-primary/90',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-muted',
                destructive:
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            },
        },
        defaultVariants: { variant: 'primary' },
    },
);

export type ButtonProps = ComponentProps<'button'> &
    VariantProps<typeof buttonVariants>;

export function Button({
    className,
    variant,
    type = 'button',
    ...props
}: ButtonProps) {
    return (
        <button
            data-slot="button"
            type={type}
            className={cn(buttonVariants({ variant }), className)}
            {...props}
        />
    );
}
