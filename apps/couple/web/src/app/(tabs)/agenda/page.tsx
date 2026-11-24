import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerTranslation } from '@/i18n/server';
import {
    AGENDA_NAMESPACE,
    AgendaContainer,
    loadCalendarEvents,
    presentAgendaPage,
    presentAgendaQuery,
    presentAgendaRanges,
    presentToday,
} from '@/modules/agenda';
import { loadMyCouple, resolveHomeDestination } from '@/modules/pairing';

type Props = {
    readonly searchParams: Promise<
        Readonly<Record<string, string | string[] | undefined>>
    >;
};

export async function generateMetadata(): Promise<Metadata> {
    const t = await getServerTranslation(AGENDA_NAMESPACE);
    return { title: t('title') };
}

// Read for the signed-in partner on every request, never prerendered at build (decision 0036).
export const dynamic = 'force-dynamic';

// The "Agenda" tab: the grid of the month shown, then the events of the chosen day (decision 0048).
export default async function AgendaPage({ searchParams }: Props) {
    const today = presentToday(new Date());
    const query = presentAgendaQuery(await searchParams, today);
    const ranges = presentAgendaRanges(query);
    const [couple, events, dayEvents] = await Promise.all([
        loadMyCouple(),
        loadCalendarEvents(ranges.grid),
        ranges.day === null ? null : loadCalendarEvents(ranges.day),
    ]);
    const destination = resolveHomeDestination(couple);
    if (destination !== null) redirect(destination);
    const page = presentAgendaPage({ couple, events, dayEvents, query, today });
    if (page.redirectTo !== null) redirect(page.redirectTo);
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-5 pt-10 pb-6">
            <AgendaContainer
                key={`${query.day}/${query.month}`}
                viewModel={page.viewModel}
            />
        </main>
    );
}
