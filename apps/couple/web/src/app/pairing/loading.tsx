import { Skeleton } from '@cocooning/design-system';

// Shown while the page reads the couple (core-frontend.md rule 9): the shape of the invitation screen.
export default function PairingLoading() {
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-5 py-6">
            <Skeleton className="h-9 w-48" />
            <section className="flex w-full max-w-sm flex-col gap-4">
                <Skeleton className="h-36 w-full rounded-2xl" />
                <Skeleton className="h-44 w-full rounded-2xl" />
            </section>
        </main>
    );
}
