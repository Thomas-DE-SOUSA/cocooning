type Props = { readonly label: string };

// R32: a sage dot and a few words while the other partner is in the list; read out once by screen readers.
export function PartnerPresenceBadge({ label }: Props) {
    return (
        <span
            role="status"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
        >
            <span
                aria-hidden="true"
                className="size-2 rounded-full bg-label-sage"
            />
            {label}
        </span>
    );
}
