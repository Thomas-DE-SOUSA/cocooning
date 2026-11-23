import { fireEvent, render, screen } from '@testing-library/react';
import GlobalError from './global-error';

describe('Feature: last-resort error screen', () => {
    it('offers to try again', () => {
        const resets: string[] = [];
        render(<GlobalError reset={() => resets.push('reset')} />, {
            container: document,
        });

        fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));

        expect(resets).toEqual(['reset']);
    });
});
