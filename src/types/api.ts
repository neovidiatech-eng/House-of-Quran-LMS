export interface ApiResponse<T = any> {
    message: string;
    status: number;
    data: T;
}

export interface Pagination {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
}

export interface ApiPaginationResponse<T> {
    message: string;
    status: number;
    data: {
        items: T[];
        pagination: Pagination;
    };
}

export interface ApiErrorResponse {
    message: string;
    errors?: string[] | Record<string, string[]>;
}
