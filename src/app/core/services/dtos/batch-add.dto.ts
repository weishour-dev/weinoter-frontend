export interface BaseBatchAddDto {
  id?: number;
  terminalId?: number;
  type?: string | number;
  addCount: number;
  rowCount: number;
}
