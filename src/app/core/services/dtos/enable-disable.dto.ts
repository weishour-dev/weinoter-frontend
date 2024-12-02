export interface BaseEnableDisableDto {
  ids?: Array<string | number>;
  codes?: Array<string | number>;
  status: boolean;
}
