import { use } from 'react';

export function ForbiddenUseView({
    notes,
}: {
    readonly notes: Promise<string>;
}) {
    return <p>{use(notes)}</p>;
}
