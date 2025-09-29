export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationSchemas<TBody = any, TQuery = any, TParams = any> {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
}