export type FormActionType = 'add' | 'edit';

export interface FormActionArgs<T = object> {
  actionType: FormActionType;
  data: T;
}
