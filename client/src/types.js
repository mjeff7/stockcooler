// @flow

import type { Event } from './events';

export type ChartableDatum = { Date: Date };
export type ChartableData = Array<ChartableDatum>;
export type Color = string;
export type Subscriber = Event => void;
