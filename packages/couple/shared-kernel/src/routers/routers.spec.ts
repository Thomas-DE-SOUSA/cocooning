import { API_ROUTE_GROUPS, ApiRouterEnum } from './api/api-router.enum';
import type { RouteGroup } from './route-group';
import { WEB_ROUTE_GROUPS, WebRouterEnum } from './web/web-router.enum';

function findDuplicatedKeys(groups: readonly RouteGroup[]): string[] {
    const keys = groups.flatMap((group) => Object.keys(group));
    return keys.filter((key, index) => keys.indexOf(key) !== index);
}

function countKeys(groups: readonly RouteGroup[]): number {
    return groups.reduce(
        (total, group) => total + Object.keys(group).length,
        0,
    );
}

describe.each([
    { name: 'ApiRouterEnum', groups: API_ROUTE_GROUPS, router: ApiRouterEnum },
    { name: 'WebRouterEnum', groups: WEB_ROUTE_GROUPS, router: WebRouterEnum },
])('Feature: $name gathers every route group', ({ groups, router }) => {
    describe('Scenario: two route groups declare the same key', () => {
        it('lists no duplicated key, since a spread would overwrite it', () => {
            expect(findDuplicatedKeys(groups)).toEqual([]);
        });
    });

    describe('Scenario: a route group is added to the router', () => {
        it('holds exactly the keys of the listed groups', () => {
            expect(Object.keys(router)).toHaveLength(countKeys(groups));
        });
    });
});

describe('Feature: duplicated key detection', () => {
    describe('Scenario: two groups share a key', () => {
        it('reports the shared key', () => {
            const notes = { NOTE_LIST: '/notes' };
            const agenda = { NOTE_LIST: '/agenda', EVENT_LIST: '/events' };
            expect(findDuplicatedKeys([notes, agenda])).toEqual(['NOTE_LIST']);
        });
    });
});
