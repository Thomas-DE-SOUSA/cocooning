import {
    CreateCalendarLabelUseCase,
    DeleteCalendarLabelUseCase,
    EditCalendarLabelUseCase,
    ListCalendarLabelsUseCase,
} from '@cocooning/couple-server-business-logic/agenda';
import { agendaUseCase } from './agenda-use-case.factory';

const labelMutation = <T>(
    token: new (
        ...args: ConstructorParameters<typeof EditCalendarLabelUseCase>
    ) => T,
) =>
    agendaUseCase(
        token,
        (d) =>
            new token(
                d.labelRepository,
                d.labelPreconditions,
                d.clock,
                d.publishing,
            ),
    );

// The labels shared by the couple (R12 to R14, decision 0056).
export const LABEL_USE_CASES = [
    agendaUseCase(
        ListCalendarLabelsUseCase,
        (d) => new ListCalendarLabelsUseCase(d.labelRepository),
    ),
    labelMutation(CreateCalendarLabelUseCase),
    labelMutation(EditCalendarLabelUseCase),
    agendaUseCase(
        DeleteCalendarLabelUseCase,
        (d) =>
            new DeleteCalendarLabelUseCase(
                d.labelRepository,
                d.repository,
                d.labelPreconditions,
                d.unitOfWork,
                d.clock,
                d.publishing,
            ),
    ),
];
