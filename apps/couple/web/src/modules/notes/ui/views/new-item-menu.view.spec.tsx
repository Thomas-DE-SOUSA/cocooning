import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { WithI18n } from '@/testing/with-i18n';
import { NewItemMenuView } from './new-item-menu.view';

function renderMenu(isOpen: boolean) {
    const events: string[] = [];
    render(
        <WithI18n>
            <NewItemMenuView
                menuRef={createRef<HTMLDivElement>()}
                isOpen={isOpen}
                onToggle={() => events.push('toggle')}
                onClose={() => events.push('close')}
                onNewNote={() => events.push('note')}
                onNewFolder={() => events.push('folder')}
            />
        </WithI18n>,
    );
    return { events };
}

const plus = () =>
    screen.getByRole('button', { name: 'Nouvelle note ou nouveau dossier' });

describe('Feature: the « + » of a space (decision 0053)', () => {
    it('opens its menu from a closed button', () => {
        const { events } = renderMenu(false);

        expect(plus().getAttribute('aria-expanded')).toBe('false');
        expect(
            screen.queryByRole('button', { name: 'Nouvelle note' }),
        ).toBeNull();
        fireEvent.click(plus());
        expect(events).toEqual(['toggle']);
    });

    it('R13, offers a new note or a new folder', () => {
        const { events } = renderMenu(true);

        expect(plus().getAttribute('aria-expanded')).toBe('true');
        fireEvent.click(screen.getByRole('button', { name: 'Nouvelle note' }));
        fireEvent.click(
            screen.getByRole('button', { name: 'Nouveau dossier' }),
        );
        expect(events).toEqual(['note', 'folder']);
    });

    it('closes on Escape', () => {
        const { events } = renderMenu(true);

        fireEvent.keyDown(
            screen.getByRole('button', { name: 'Nouvelle note' }),
            {
                key: 'Escape',
            },
        );
        expect(events).toEqual(['close']);
    });
});
