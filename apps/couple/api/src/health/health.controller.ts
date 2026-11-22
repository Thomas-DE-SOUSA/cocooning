import { Controller, Get } from '@nestjs/common';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import { Public } from '@cocooning/server-infrastructure/nest';

const HEALTHY = { status: 'UP' } as const;

@Public()
@Controller()
export class HealthController {
    constructor(private readonly prisma: PrismaService) {}

    @Get(ApiRouterEnum.HEALTH_CHECK)
    async handle(): Promise<typeof HEALTHY> {
        await this.prisma.client.$queryRaw`SELECT 1`;
        return HEALTHY;
    }
}
