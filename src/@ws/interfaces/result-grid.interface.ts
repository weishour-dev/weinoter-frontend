import { DataManager } from '@syncfusion/ej2-data';
import type { SafeAny } from '@ws/types';

export interface ResultGrid<T = SafeAny> {
  result: T;
  count: number;
  dataManager: DataManager;
}
