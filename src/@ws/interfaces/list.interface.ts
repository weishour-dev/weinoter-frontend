import type { SafeAny } from '@ws/types';
export type ListDataSource = { [key: string]: object };
export type ListData<T = SafeAny> = { id: number; name: string; description?: string; data?: T };
