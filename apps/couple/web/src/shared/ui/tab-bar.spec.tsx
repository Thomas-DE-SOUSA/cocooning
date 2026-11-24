import { render, screen, within } from '@testing-library/react';
import { Heart, NotebookText } from 'lucide-react';
import { TabBar } from './tab-bar';

const renderTabBar = () =>
    render(
        <TabBar
            label="Navigation principale"
            items={[
                {
                    href: '/',
                    label: 'Notes',
                    icon: NotebookText,
                    isActive: true,
                },
                {
                    href: '/couple',
                    label: 'Nous',
                    icon: Heart,
                    isActive: false,
                },
            ]}
        />,
    );

describe('Feature: the tab bar of the app', () => {
    it('links every tab to its page', () => {
        renderTabBar();

        const navigation = within(
            screen.getByRole('navigation', { name: 'Navigation principale' }),
        );
        expect(
            navigation.getByRole('link', { name: 'Nous' }).getAttribute('href'),
        ).toBe('/couple');
    });

    it('marks only the active tab as the current page', () => {
        renderTabBar();

        expect(
            screen
                .getByRole('link', { name: 'Notes' })
                .getAttribute('aria-current'),
        ).toBe('page');
        expect(
            screen
                .getByRole('link', { name: 'Nous' })
                .getAttribute('aria-current'),
        ).toBe('false');
    });
});
