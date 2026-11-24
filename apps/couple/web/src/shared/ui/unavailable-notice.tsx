import { Button } from '@cocooning/design-system';

type Props = {
    readonly title: string;
    readonly description: string;
    readonly retryLabel: string;
    readonly onRetry: () => void;
};

// A screen whose data could not be read: why, and a way to try again (decision 0036).
export function UnavailableNotice({
    title,
    description,
    retryLabel,
    onRetry,
}: Props) {
    return (
        <section
            role="alert"
            className="flex w-full flex-col gap-4 text-center"
        >
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            <Button
                variant="outline"
                onClick={onRetry}
            >
                {retryLabel}
            </Button>
        </section>
    );
}
