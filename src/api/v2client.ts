import createClient from 'openapi-fetch';
import { resolveApiBasePath } from './client';
import type { paths } from './v2';

export const v2BaseUrl = import.meta.env.DEV ? '/v2' : resolveApiBasePath();

export const apiClient = createClient<paths>({
  baseUrl: v2BaseUrl,
  credentials: 'include', // Sends the `user` session cookie automatically on every request
});
