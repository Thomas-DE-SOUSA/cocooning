import { Skeleton } from '@cocooning/design-system';

// Shown while the page reads the couple (core-frontend.md rule 9): the shape of the page.
export default function CoupleOverviewLoading() {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-5 pt-10 pb-6">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-24 w-full rounded-2xl" />
        </main>
    );
}
