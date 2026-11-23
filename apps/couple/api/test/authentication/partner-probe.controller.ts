import { Controller, Get } from '@nestjs/common';
import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import { CurrentPartner } from '../../src/modules/authentication';

export const PROBE_ROUTE = '/e2e-probe/partner';

// A test-only route behind the global guard: it echoes the partner the guard attached to the request.
@Controller()
export class PartnerProbeController {
    @Get(PROBE_ROUTE)
    handle(@CurrentPartner() partner: PartnerContext): PartnerContext {
        return partner;
    }
}
