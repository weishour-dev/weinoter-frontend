import { CrudOptions, DataManager, ParamOption, Query, RemoteArgs } from '@syncfusion/ej2-data';

export interface InsertGrid {
  dm?: DataManager;
  data?: object;
  tableName?: string;
  query?: Query;
  position?: number;
}

export interface RemoveGrid {
  dm?: DataManager;
  keyField?: string;
  val?: object;
  tableName?: string;
  query?: Query;
}

export interface UpdateGrid {
  dm?: DataManager;
  keyField?: string;
  val?: object;
  tableName?: string;
  query?: Query;
}

export interface BatchGrid {
  dm?: DataManager;
  changes?: CrudOptions;
  e?: RemoteArgs;
  query?: Query;
  original?: object;
}

export interface ParamsOptions {
  dm?: DataManager;
  query?: Query;
  params?: ParamOption[];
  reqParams?: {
    [key: string]: object;
  };
}
