'use client';

import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { CalendarDays, Heart, NotebookText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { TabBar } from '@/shared/ui/tab-bar';

const TABS = [
    { href: WebRouterEnum.HOME, key: 'navigation.notes', icon: NotebookText },
    {
        href: WebRouterEnum.AGENDA,
        key: 'navigation.agenda',
        icon: CalendarDays,
    },
    {
        href: WebRouterEnum.COUPLE_OVERVIEW,
        key: 'navigation.couple',
        icon: Heart,
    },
] as const;

// One tab per shipped screen (decision 0044): messages joins when it exists.
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
                isActive: pathname === tab.href,
            }))}
        />
    );
}
