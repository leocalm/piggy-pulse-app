export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }
}
