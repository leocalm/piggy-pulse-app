import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGet } from './client';
import { ApiError } from './errors';

const fetchMock = vi.fn();

function createErrorResponse(status: number, body: string) {
  return {
    ok: false,
    status,
    headers: {
      get: vi.fn().mockReturnValue(null),
    },
    text: vi.fn().mockResolvedValue(body),
  };
}

describe('api client error handling', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws ApiError with parsed JSON data', async () => {
    const body = JSON.stringify({ message: 'Bad request', error_code: 'bad_request' });
    fetchMock.mockResolvedValue(createErrorResponse(400, body) as unknown as Response);

    try {
      await apiGet('/api/test');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.status).toBe(400);
      expect(apiError.url).toBe('/api/test');
      expect(apiError.message).toBe('Bad request');
      expect(apiError.data).toEqual({ message: 'Bad request', errorCode: 'bad_request' });
      return;
    }

    throw new Error('Expected apiGet to throw ApiError');
  });

  it('falls back to text when error body is not JSON', async () => {
    fetchMock.mockResolvedValue(createErrorResponse(500, 'Server exploded') as unknown as Response);

    try {
      await apiGet('/api/test');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.status).toBe(500);
      expect(apiError.message).toBe('Server exploded');
      expect(apiError.data).toBe('Server exploded');
      return;
    }

    throw new Error('Expected apiGet to throw ApiError');
  });

  it('clears stored auth and redirects on 401', async () => {
    localStorage.setItem('user', 'test-user');
    sessionStorage.setItem('user', 'test-user');

    const assignSpy = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
    fetchMock.mockResolvedValue(
      createErrorResponse(401, JSON.stringify({ message: 'Unauthorized' })) as unknown as Response
    );

    await expect(apiGet('/api/test')).rejects.toBeInstanceOf(ApiError);

    expect(localStorage.getItem('user')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
    expect(assignSpy).toHaveBeenCalledWith('/auth/login');
  });
});
