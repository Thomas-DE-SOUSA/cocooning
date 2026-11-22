import { UnitOfWork } from '@cocooning/shared-kernel/ports';
import type { PrismaService, TransactionOptions } from './prisma.service';

export class PrismaUnitOfWork extends UnitOfWork {
    constructor(
        private readonly prisma: PrismaService,
        private readonly options: TransactionOptions,
    ) {
        super();
    }

    override run<T>(work: () => Promise<T>): Promise<T> {
        return this.prisma.transaction(work, this.options);
    }
}
