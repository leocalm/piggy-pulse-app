import { describe, expect, it } from 'vitest';
import { ApiError } from './errors';

describe('ApiError', () => {
  it('exposes status helpers', () => {
    const error = new ApiError('Unauthorized', 401, '/api/test');

    expect(error.isUnauthorized).toBe(true);
    expect(error.isNotFound).toBe(false);
    expect(error.isValidationError).toBe(false);
  });

  it('flags validation errors for 400 and 422', () => {
    const badRequest = new ApiError('Bad request', 400, '/api/test');
    const unprocessable = new ApiError('Unprocessable', 422, '/api/test');

    expect(badRequest.isValidationError).toBe(true);
    expect(unprocessable.isValidationError).toBe(true);
  });
});
