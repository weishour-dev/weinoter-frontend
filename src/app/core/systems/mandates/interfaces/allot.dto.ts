import { ResourceItem } from './mandate';

export interface AllotMandateDto {
  targetType: string;
  targetId: number;
  permissionIds?: number[];
  resources?: ResourceItem[];
}
