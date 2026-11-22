import type { INestApplication } from '@nestjs/common';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { closeTestApp, createTestApp } from '../shared/app/create-test-app';
import { TestClient } from '../shared/app/test-client';

describe('Feature: the API reports its health', () => {
    let app: INestApplication;
    let client: TestClient;

    beforeAll(async () => {
        app = await createTestApp();
        client = await TestClient.for(app);
    });
    afterAll(async () => {
        await closeTestApp(app);
    });

    describe('Scenario: the database answers, no session cookie', () => {
        it('answers 200 UP, since the health route is public', async () => {
            const response = await client
                .unauthenticated()
                .get(ApiRouterEnum.HEALTH_CHECK);
            expect(response).toEqual({ status: 200, body: { status: 'UP' } });
        });
    });
});
