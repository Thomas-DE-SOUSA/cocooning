import type { ReactNode } from 'react';
import { MainNavigation } from './main-navigation';

// The screens of the tab bar; the page of a note and the screens before the couple have none (decision 0044).
export default function TabsLayout({
    children,
}: {
    readonly children: ReactNode;
}) {
    return (
        <>
            <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
                {children}
            </div>
            <MainNavigation />
        </>
    );
}
