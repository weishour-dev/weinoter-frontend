export type DevuiTabOptions = {
  id: number | string;
  code?: number;
  title?: string;
  name?: string;
  disabled?: boolean;
  active?: boolean;
  [key: string]: number | string | boolean;
};
