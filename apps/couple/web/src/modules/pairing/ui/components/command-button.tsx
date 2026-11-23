import { Button, type ButtonProps, Spinner } from '@cocooning/design-system';

type Props = {
    readonly variant: ButtonProps['variant'];
    readonly label: string;
    readonly pendingLabel: string;
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly onClick: () => void;
};

// A pairing command: disabled while any command runs, the Spinner only on the running one (core-frontend.md rule 9).
export function CommandButton({
    variant,
    label,
    pendingLabel,
    isPending,
    isBusy,
    onClick,
}: Props) {
    return (
        <Button
            variant={variant}
            onClick={onClick}
            disabled={isBusy}
            aria-busy={isPending}
        >
            {isPending ? <Spinner aria-label={pendingLabel} /> : label}
        </Button>
    );
}
