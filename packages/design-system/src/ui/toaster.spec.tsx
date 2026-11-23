import { act, render, screen } from '@testing-library/react';
import { toast, Toaster } from './toaster';

describe('Feature: transient notifications', () => {
    it('shows a toast sent through toast()', async () => {
        render(<Toaster />);

        act(() => {
            toast.error('Ce code ne marche pas');
        });

        expect(await screen.findByText('Ce code ne marche pas')).toBeTruthy();
    });
});
