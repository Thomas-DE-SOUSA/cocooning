import { fireEvent, render, screen } from '@testing-library/react';
import { SwipeToDelete } from './swipe-to-delete';

const ROW_WIDTH = 360;

function renderRow({ isRemoved = false, disabled = false } = {}) {
    const events: string[] = [];
    render(
        <SwipeToDelete
            label="Supprimer"
            onDelete={() => events.push('delete')}
            isRemoved={isRemoved}
            disabled={disabled}
        >
            <button
                type="button"
                onClick={() => events.push('open')}
            >
                Dîner chez Léa
            </button>
        </SwipeToDelete>,
    );
    const row = screen.getByText('Dîner chez Léa').parentElement!;
    Object.defineProperty(row.parentElement!, 'offsetWidth', {
        value: ROW_WIDTH,
    });
    row.setPointerCapture = () => undefined;
    return { events, row };
}

function swipe(row: HTMLElement, distance: number) {
    fireEvent.pointerDown(row, { clientX: 300, clientY: 20, pointerId: 1 });
    fireEvent.pointerMove(row, { clientX: 280, clientY: 20, pointerId: 1 });
    fireEvent.pointerMove(row, {
        clientX: 300 - distance,
        clientY: 20,
        pointerId: 1,
    });
    fireEvent.pointerUp(row, { clientX: 300 - distance, pointerId: 1 });
}

function tap(element: HTMLElement) {
    fireEvent.pointerDown(element, { clientX: 100, clientY: 20, pointerId: 2 });
    fireEvent.pointerUp(element, { clientX: 100, clientY: 20, pointerId: 2 });
    fireEvent.click(element);
}

describe('Feature: a row deleted by a swipe to the left', () => {
    it('at rest, hides the delete button and lets a tap through', () => {
        const { events } = renderRow();

        tap(screen.getByText('Dîner chez Léa'));

        expect(screen.queryByRole('button', { name: 'Supprimer' })).toBeNull();
        expect(events).toEqual(['open']);
    });

    it('half swiped, stays open on the delete button, which deletes', () => {
        const { events, row } = renderRow();

        swipe(row, 80);
        fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));

        expect(row.style.transform).toBe('translateX(-96px)');
        expect(events).toEqual(['delete']);
    });

    it('half swiped, closes on a tap of the row without opening it', () => {
        const { events, row } = renderRow();

        swipe(row, 80);
        tap(screen.getByText('Dîner chez Léa'));

        expect(row.style.transform).toBe('translateX(0px)');
        expect(events).toEqual([]);
    });

    it('swiped across most of the row, deletes on release', () => {
        const { events, row } = renderRow();

        swipe(row, 260);

        expect(events).toEqual(['delete']);
    });

    it('a short swipe falls back closed', () => {
        const { events, row } = renderRow();

        swipe(row, 30);

        expect(row.style.transform).toBe('translateX(0px)');
        expect(events).toEqual([]);
    });

    it('removed by the app, slides the row out of view', () => {
        const { row } = renderRow({ isRemoved: true });

        expect(row.style.transform).toBe('translateX(-100%)');
    });

    it('disabled, does not move', () => {
        const { events, row } = renderRow({ disabled: true });

        swipe(row, 260);

        expect(row.style.transform).toBe('translateX(0px)');
        expect(events).toEqual([]);
    });
});
