import { createContext } from 'react';
import type { DayMarks } from '../../view-models/agenda-screen.view-model';

// react-day-picker renders each day button itself: the marks of the month reach them through this context.
export const DayMarksContext = createContext<DayMarks>({});
