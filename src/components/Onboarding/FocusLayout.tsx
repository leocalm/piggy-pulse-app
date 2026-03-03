import { ReactNode } from 'react';
import { Box, Container, Text } from '@mantine/core';

interface FocusLayoutProps {
  children: ReactNode;
}

export function FocusLayout({ children }: FocusLayoutProps) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 48,
      }}
    >
      <Container size={600} w="100%">
        <Text fw={700} size="xl" mb="xl" style={{ fontFamily: 'Sora, sans-serif' }}>
          PiggyPulse
        </Text>
        {children}
      </Container>
    </Box>
  );
}
