import { fireEvent, render, screen } from '@testing-library/react';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerNested,
    DrawerTitle,
} from './drawer';

function renderDrawer(open: boolean) {
    const changes: boolean[] = [];
    render(
        <Drawer
            open={open}
            onOpenChange={(next) => changes.push(next)}
        >
            <DrawerContent className="gap-4">
                <DrawerHeader>
                    <DrawerTitle>Nouvel événement</DrawerTitle>
                </DrawerHeader>
                <DrawerDescription>Le jour et les heures</DrawerDescription>
            </DrawerContent>
        </Drawer>,
    );
    return { changes };
}

describe('Feature: a bottom sheet', () => {
    describe('Scenario: an open sheet', () => {
        it('is a dialog named by its title and described by its description', () => {
            renderDrawer(true);

            const sheet = screen.getByRole('dialog', {
                name: 'Nouvel événement',
            });
            expect(sheet.getAttribute('data-slot')).toBe('drawer-content');
            expect(sheet.className).toContain('gap-4');
            expect(screen.getByText('Le jour et les heures').id).toBe(
                sheet.getAttribute('aria-describedby'),
            );
        });

        it('is dragged by its handle only, never by the scrolled form', () => {
            renderDrawer(true);

            const handle = screen
                .getByRole('dialog')
                .querySelector('[data-slot="drawer-handle"]');
            expect(handle?.hasAttribute('data-vaul-handle')).toBe(true);
        });

        it('asks to close on Escape', () => {
            const { changes } = renderDrawer(true);

            fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

            expect(changes).toEqual([false]);
        });
    });

    describe('Scenario: a closed sheet', () => {
        it('renders nothing', () => {
            renderDrawer(false);

            expect(screen.queryByRole('dialog')).toBeNull();
        });
    });

    describe('Scenario: a sheet opened from inside another one', () => {
        function Stacked({
            isNestedOpen,
            changes,
        }: {
            readonly isNestedOpen: boolean;
            readonly changes: boolean[];
        }) {
            return (
                <Drawer open>
                    <DrawerContent>
                        <DrawerTitle>Nouvel événement</DrawerTitle>
                        <DrawerDescription>L'événement</DrawerDescription>
                    </DrawerContent>
                    <DrawerNested
                        open={isNestedOpen}
                        onOpenChange={(next) => changes.push(next)}
                    >
                        <DrawerContent>
                            <DrawerTitle>Nouvelle étiquette</DrawerTitle>
                            <DrawerDescription>Le nom</DrawerDescription>
                        </DrawerContent>
                    </DrawerNested>
                </Drawer>
            );
        }

        it('stacks a second dialog above the first, closed by Escape alone', () => {
            const changes: boolean[] = [];
            const { rerender } = render(
                <Stacked
                    isNestedOpen={false}
                    changes={changes}
                />,
            );
            rerender(
                <Stacked
                    isNestedOpen
                    changes={changes}
                />,
            );

            const nested = screen.getByRole('dialog', {
                name: 'Nouvelle étiquette',
            });
            expect(
                screen.queryByRole('dialog', { name: 'Nouvel événement' }),
            ).toBeNull();
            fireEvent.keyDown(nested, { key: 'Escape' });

            expect(changes).toEqual([false]);
        });
    });
});
