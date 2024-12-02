export interface BaseSortDto {
  ids: Array<string | number>;
  type?: string | number;
  typeName?: string;
  order?: 'ASC' | 'DESC';
}
