export function successResponse<T>(data: T, message = "Success") {
  return { success: true, message, data };
}

export function errorResponse(message: string, errors?: Record<string, unknown>) {
  return errors !== undefined
    ? { success: false, message, errors }
    : { success: false, message };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
}

export function paginatedResponse<T>(data: T[], meta: PaginationMeta) {
  return { data, meta };
}
