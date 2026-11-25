import { Button, Spinner } from '@cocooning/design-system';

type Props = {
    readonly label: string;
    readonly pendingLabel: string;
    readonly isPending: boolean;
    readonly isBusy: boolean;
};

// The main button of a sheet's form: disabled while a command runs, the Spinner while its own does (rule 9).
export function SubmitButton({
    label,
    pendingLabel,
    isPending,
    isBusy,
}: Props) {
    return (
        <Button
            type="submit"
            className="h-12 w-full text-base"
            disabled={isBusy}
            aria-busy={isPending}
        >
            {isPending ? <Spinner aria-label={pendingLabel} /> : label}
        </Button>
    );
}
