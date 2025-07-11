export interface AbstractResponseDto<T> {
    payload: T;
}

export interface Pageable<T> {
    entries: Array<T>;
    total: number;
    page: number;
    perPage: number;
}
