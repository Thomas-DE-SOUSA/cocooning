import { Skeleton } from '@cocooning/design-system';

// Shown while the tab reads the lists (core-frontend.md rule 9): the title, the sections, then two lists.
export default function NoteListsLoading() {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 px-5 pt-10 pb-24">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-13 w-full rounded-xl" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-15 w-full rounded-2xl" />
            <Skeleton className="h-15 w-full rounded-2xl" />
        </main>
    );
}
