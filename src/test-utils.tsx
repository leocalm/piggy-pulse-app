import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <MantineProvider>{children}</MantineProvider>
        </QueryClientProvider>
    );
};

const renderWithProviders = (ui: React.ReactElement, options?: RenderOptions) => {
    return render(ui, { wrapper: createWrapper(), ...options });
};

import userEvent from '@testing-library/user-event';

export * from '@testing-library/react';
export { renderWithProviders as render, userEvent };
