'use client';

import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { CalendarDays, Heart, MessageCircle, NotebookText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { TabBar } from '@/shared/ui/tab-bar';
import { isActiveTab } from './active-tab';

const TABS = [
    {
        href: WebRouterEnum.HOME,
        key: 'navigation.notes',
        icon: NotebookText,
        routes: [
            WebRouterEnum.HOME,
            WebRouterEnum.NOTE_SPACE,
            WebRouterEnum.NOTE_EDITOR,
        ],
    },
    {
        href: WebRouterEnum.AGENDA,
        key: 'navigation.agenda',
        icon: CalendarDays,
        routes: [WebRouterEnum.AGENDA],
    },
    {
        href: WebRouterEnum.MESSAGES,
        key: 'navigation.messages',
        icon: MessageCircle,
        routes: [WebRouterEnum.MESSAGES],
    },
    {
        href: WebRouterEnum.COUPLE_OVERVIEW,
        key: 'navigation.couple',
        icon: Heart,
        routes: [WebRouterEnum.COUPLE_OVERVIEW],
    },
] as const;

// One tab per shipped screen (decision 0044); each stays active on the screens reached from it (decision 0053).
export function MainNavigation() {
    const { t } = useTranslation('generic');
    const pathname = usePathname();
    return (
        <TabBar
            label={t('navigation.label')}
            items={TABS.map((tab) => ({
                href: tab.href,
                label: t(tab.key),
                icon: tab.icon,
                isActive: isActiveTab(pathname, tab.routes),
            }))}
        />
    );
}
