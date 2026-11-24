import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../utils/cn';

const badgeVariants = cva(
    'inline-flex h-6 shrink-0 items-center rounded-sm px-2 text-xs font-semibold whitespace-nowrap',
    {
        variants: {
            variant: {
                secondary: 'bg-secondary text-secondary-foreground',
                outline: 'border border-input text-muted-foreground',
            },
        },
        defaultVariants: { variant: 'secondary' },
    },
);

export type BadgeProps = ComponentProps<'span'> &
    VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <span
            data-slot="badge"
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
}
