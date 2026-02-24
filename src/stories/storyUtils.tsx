import React from 'react';
import { Decorator } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse, delay } from 'msw';
import { BudgetProvider } from '@/context/BudgetContext';
import { Box } from '@mantine/core';

interface StoryDecoratorOptions {
  /** Include BudgetProvider (period selection context). Default: true */
  withBudgetProvider?: boolean;
  /** Wrap story in a padded Box. Default: true */
  padding?: boolean;
}

/**
 * Standard story decorator factory.
 * Always provides a fresh QueryClient and optionally BudgetProvider.
 *
 * Usage in meta:
 *   decorators: [createStoryDecorator()],
 *
 * Usage without BudgetProvider (e.g. Auth pages):
 *   decorators: [createStoryDecorator({ withBudgetProvider: false })],
 */
export const createStoryDecorator = (options: StoryDecoratorOptions = {}): Decorator => {
  const { withBudgetProvider = true, padding = true } = options;

  return (Story) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    const content = withBudgetProvider ? (
      <QueryClientProvider client={queryClient}>
        <BudgetProvider>
          {padding ? <Box p="xl"><Story /></Box> : <Story />}
        </BudgetProvider>
      </QueryClientProvider>
    ) : (
      <QueryClientProvider client={queryClient}>
        {padding ? <Box p="xl"><Story /></Box> : <Story />}
      </QueryClientProvider>
    );

    return content;
  };
};

/**
 * MSW handler shorthand helpers.
 * Use these in story parameters.msw.handlers to override specific endpoints.
 *
 * Example:
 *   parameters: {
 *     msw: {
 *       handlers: [mswHandlers.loading('/api/v1/accounts')],
 *     },
 *   },
 */
export const mswHandlers = {
  /** Returns data as JSON with a short realistic delay */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  success: (path: string, data: any, delayMs = 300) =>
    http.get(path, async () => {
      await delay(delayMs);
      return HttpResponse.json(data);
    }),

  /** Returns HTTP 500 to simulate a server error */
  error: (path: string, status = 500) =>
    http.get(path, () => new HttpResponse(null, { status })),

  /** Delays forever — shows loading state indefinitely */
  loading: (path: string) =>
    http.get(path, async () => {
      await delay('infinite');
      return HttpResponse.json(null);
    }),

  /** Returns an empty array */
  empty: (path: string) =>
    http.get(path, () => HttpResponse.json([])),

  /** Returns null (for single-resource endpoints) */
  emptyNull: (path: string) =>
    http.get(path, () => HttpResponse.json(null)),
};
