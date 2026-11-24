import { fireEvent, render, screen } from '@testing-library/react';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
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
});
