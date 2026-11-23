import { render, screen } from '@testing-library/react';
import { Spinner } from './spinner';

describe('Feature: an action in progress', () => {
    it('is announced by the label it receives and spins', () => {
        render(<Spinner aria-label="Connexion en cours" />);

        const spinner = screen.getByRole('status', {
            name: 'Connexion en cours',
        });
        expect(spinner.getAttribute('class')).toContain('animate-spin');
    });
});
