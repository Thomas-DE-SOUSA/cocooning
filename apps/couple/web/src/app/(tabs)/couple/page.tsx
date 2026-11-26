import { Card } from '@cocooning/design-system';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerTranslation } from '@/i18n/server';
import {
    CALENDAR_LABELS_NAMESPACE,
    CalendarLabelsContainer,
    loadCalendarLabels,
    presentCalendarLabelsCard,
} from '@/modules/agenda';
import { SignOutContainer } from '@/modules/authentication';
import {
    PUSH_NOTIFICATIONS_NAMESPACE,
    PushNotificationsContainer,
} from '@/modules/messaging';
import {
    loadMyCouple,
    PAIRING_NAMESPACE,
    presentCoupleOverviewPage,
} from '@/modules/pairing';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getServerTranslation(PAIRING_NAMESPACE);
    return { title: t('overview.title') };
}

// Read for the signed-in partner on every request, never prerendered at build (decision 0036).
export const dynamic = 'force-dynamic';

// The "Nous" tab: our couple, the labels of our agenda (R12 of agenda), then this phone, its notifications (R11 of
// messaging) and signing out (decision 0044).
export default async function CoupleOverviewPage() {
    const [couple, labels] = await Promise.all([
        loadMyCouple(),
        loadCalendarLabels(),
    ]);
    const page = presentCoupleOverviewPage(couple, new Date());
    if (page.redirectTo !== null) redirect(page.redirectTo);
    const t = await getServerTranslation(PAIRING_NAMESPACE);
    const tLabels = await getServerTranslation(CALENDAR_LABELS_NAMESPACE);
    const tPush = await getServerTranslation(PUSH_NOTIFICATIONS_NAMESPACE);
    const tSignOut = await getServerTranslation('authentication/sign-out');
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-5 pt-10 pb-6">
            <h1 className="text-3xl font-semibold">{t('overview.title')}</h1>
            <Card className="flex flex-col gap-2 p-5">
                <h2 className="text-xl font-semibold">
                    {t('overview.couple.title')}
                </h2>
                <p>
                    {page.viewModel.togetherTime === null
                        ? t('overview.couple.since', {
                              formedAt: page.viewModel.formedAt,
                          })
                        : t('overview.couple.togetherFor', {
                              ...page.viewModel.togetherTime,
                          })}
                </p>
            </Card>
            <Card className="flex flex-col gap-3 p-5">
                <h2 className="text-xl font-semibold">
                    {tLabels('card.title')}
                </h2>
                <CalendarLabelsContainer
                    viewModel={presentCalendarLabelsCard(labels)}
                />
            </Card>
            <Card className="flex flex-col gap-3 p-5">
                <h2 className="text-xl font-semibold">{tPush('card.title')}</h2>
                <PushNotificationsContainer />
            </Card>
            <Card className="mt-auto flex flex-col gap-3 p-5">
                <h2 className="text-xl font-semibold">
                    {tSignOut('device.title')}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {tSignOut('device.hint')}
                </p>
                <SignOutContainer />
            </Card>
        </main>
    );
}
