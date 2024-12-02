export interface MandateModel {
  id: number;
  targetType: string;
  targetId: number;
  resources: ResourceItem[];
  createdTime: string;
  updatedTime: string;
}

export interface IColumnMandateModel {
  rn?: number;
  id?: number;
  targetType?: string;
  targetId?: number;
  resources?: ResourceItem[];
  createdTime?: Date;
  updatedTime?: Date;
}

export interface ResourceItem {
  type: string;
  actions: number[];
}
