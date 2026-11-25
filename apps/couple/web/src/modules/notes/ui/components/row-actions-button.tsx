import { Ellipsis } from 'lucide-react';

type Props = {
    readonly label: string;
    readonly onClick: () => void;
};

// The « ⋯ » of a row, above the link stretched over it: it opens the sheet of the row's actions.
export function RowActionsButton({ label, onClick }: Props) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className="relative z-10 -mr-1 flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
        >
            <Ellipsis
                aria-hidden="true"
                className="size-5"
            />
        </button>
    );
}
