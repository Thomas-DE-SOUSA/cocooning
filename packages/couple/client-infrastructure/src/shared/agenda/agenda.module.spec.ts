import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { A_CALENDAR_EVENT_LIST } from '@cocooning/couple-client-business-logic/testing';
import { createAgendaModule } from './agenda.module';

describe('Feature: the web app builds the agenda use cases', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    it('reads the session only when a use case runs', async () => {
        const reads: string[] = [];
        const agenda = createAgendaModule('http://api.test', 5000, () => {
            reads.push('session');
            return Promise.resolve('session-token-1');
        });
        expect(reads).toEqual([]);

        fakeFetch.givenResponse(200, JSON.stringify(A_CALENDAR_EVENT_LIST));
        await agenda.listCalendarEvents.execute({
            from: '2026-11-30',
            to: '2027-01-03',
        });

        expect(reads).toEqual(['session']);
    });
});
