import { Skeleton } from '@cocooning/design-system';

// Shown while the page reads the couple (core-frontend.md rule 9): the shape of the invitation screen.
export default function PairingLoading() {
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-4">
            <Skeleton className="h-8 w-40" />
            <section className="flex w-full max-w-sm flex-col gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </section>
        </main>
    );
}
