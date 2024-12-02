export interface FileModel {
  id: number;
  orders: FileOrder[];
  type: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  size: number;
  fieldName: string;
  originalName: string;
  encoding: string;
  destination: string;
  path: string;
  sort: number;
  createdTime: string;
  updatedTime: string;
}

export interface IColumnFileModel {
  rn?: number;
  id?: number;
  type: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  size: number;
  fieldName: string;
  originalName: string;
  encoding: string;
  destination: string;
  path: string;
  sort: number;
  orders: FileOrder[];
  createdTime?: Date;
  updatedTime?: Date;
}

export interface FileOrder {
  entity: string;
  ids: number[];
}
