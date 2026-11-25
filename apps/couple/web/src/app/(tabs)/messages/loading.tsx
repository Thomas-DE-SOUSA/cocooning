import { Skeleton } from '@cocooning/design-system';

// Shown while the page reads the feed (core-frontend.md rule 9): the title, a day, words on both sides and a photo.
export default function MessagesLoading() {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 px-5 pt-10 pb-40">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-24 self-center" />
            <Skeleton className="h-11 w-48 self-start rounded-2xl" />
            <Skeleton className="h-64 w-56 self-end rounded-2xl" />
            <Skeleton className="h-11 w-40 self-end rounded-2xl" />
        </main>
    );
}
