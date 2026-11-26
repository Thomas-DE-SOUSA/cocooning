import { ViewerAudienceEnum } from './viewer-audience.enum';

describe('Feature: who an event is for, seen by the partner who reads it', () => {
    it('says « Moi », « Toi » or « Nous deux », each value equal to its key', () => {
        expect(ViewerAudienceEnum).toEqual({
            ME: 'ME',
            YOU: 'YOU',
            BOTH: 'BOTH',
        });
    });
});
